import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runLightScan } from "./scanner.server";

export const runScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pentestId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(input.pentestId)) throw new Error("ID inválido");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: p, error } = await supabase.from("pentests").select("*").eq("id", data.pentestId).maybeSingle();
    if (error || !p) return { ok: false as const, error: "Pentest não encontrado." };
    if (p.engine !== "light") return { ok: false as const, error: "Este pentest usa o worker Strix." };
    if (!p.authorized_at) return { ok: false as const, error: "Autorização não confirmada." };
    if (p.status !== "running") return { ok: false as const, error: "Pentest já foi executado." };

    try {
      const { findings, host } = await runLightScan(p.target);
      if (findings.length) {
        const { error: fe } = await supabase.from("findings").insert(
          findings.map((f) => ({ ...f, user_id: userId, pentest_id: p.id, source: "light" })),
        );
        if (fe) throw new Error(fe.message);
      }
      const n = (s: string) => findings.filter((f) => f.severity === s).length;
      const worst = n("critical") ? "critical" : n("high") ? "high" : n("medium") ? "medium" : n("low") ? "low" : "none";
      await supabase.from("assets").delete().eq("host", host);
      await supabase.from("assets").insert({
        user_id: userId, host, kind: p.kind === "api" ? "API" : "Web", exposure: worst,
        note: `${findings.length} achado(s) na última verificação`,
      });
      await supabase.from("pentests").update({
        status: "completed", critical: n("critical"), high: n("high"), medium: n("medium"), low: n("low"),
        finished_at: new Date().toISOString(),
      }).eq("id", p.id);
      return { ok: true as const, total: findings.length };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha na execução";
      await supabase.from("pentests").update({ status: "failed", error: msg, finished_at: new Date().toISOString() }).eq("id", p.id);
      return { ok: false as const, error: msg };
    }
  });
