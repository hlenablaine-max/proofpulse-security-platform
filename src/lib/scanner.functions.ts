import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runLightScan, type ScanFinding } from "./scanner.server";

function aiErrorMessage(e: unknown): string {
  const status = (e as { statusCode?: number })?.statusCode;
  if (status === 402) return "Créditos de IA insuficientes para executar o agente.";
  if (status === 429) return "Limite de requisições de IA atingido; tente novamente em instantes.";
  if (e instanceof Error && /abort|timeout/i.test(e.name + e.message)) return "O agente excedeu o tempo máximo.";
  return "A análise de IA não pôde ser concluída.";
}

export const runScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pentestId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(input.pentestId)) throw new Error("ID inválido");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Claim atômico: só uma execução move queued -> running.
    const { data: p } = await supabase
      .from("pentests")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", data.pentestId).eq("status", "queued").not("authorized_at", "is", null)
      .in("engine", ["light", "deep"]).in("kind", ["web", "api"])
      .select("*").maybeSingle();
    if (!p) return { ok: false as const, error: "Pentest não encontrado, sem autorização ou já executado." };

    const fail = async (msg: string) => {
      await supabase.from("pentests").update({ status: "failed", error: msg, finished_at: new Date().toISOString() }).eq("id", p.id);
      return { ok: false as const, error: msg };
    };

    try {
      const { findings: baseline, host } = await runLightScan(p.target);
      let agentFindings: ScanFinding[] = [];
      let report: string | null = null;
      let notice: string | null = null;

      if (p.engine === "deep") {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) notice = "Agente de IA não configurado.";
        else {
          try {
            const { runAgent } = await import("./agent.server");
            const r = await runAgent(p.target, baseline, { apiKey });
            agentFindings = r.findings;
            report = r.report;
          } catch (e) {
            console.error("agent failed", e);
            notice = aiErrorMessage(e);
          }
        }
        if (notice) report = `## Relatório parcial\n\nA linha de base foi executada, mas a etapa do agente falhou: ${notice}\n\nOs achados abaixo vêm apenas das verificações básicas.`;
      }

      const rows = [
        ...baseline.map((f) => ({ ...f, source: "light" })),
        ...agentFindings.map((f) => ({ ...f, source: "deep" })),
      ].map((f) => ({ ...f, user_id: userId, pentest_id: p.id }));
      if (rows.length) {
        const { error: fe } = await supabase.from("findings").insert(rows);
        if (fe) throw new Error(fe.message);
      }
      const all = [...baseline, ...agentFindings];
      const n = (s: string) => all.filter((f) => f.severity === s).length;
      const worst = n("critical") ? "critical" : n("high") ? "high" : n("medium") ? "medium" : n("low") ? "low" : "none";
      await supabase.from("assets").delete().eq("host", host);
      await supabase.from("assets").insert({
        user_id: userId, host, kind: p.kind === "api" ? "API" : "Web", exposure: worst,
        note: `${all.length} achado(s) na última verificação`,
      });
      const { error: ue } = await supabase.from("pentests").update({
        status: "completed", critical: n("critical"), high: n("high"), medium: n("medium"), low: n("low"),
        report, error: notice, finished_at: new Date().toISOString(),
      }).eq("id", p.id);
      if (ue) throw new Error(ue.message);
      return { ok: true as const, total: all.length, notice };
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Falha na execução");
    }
  });
