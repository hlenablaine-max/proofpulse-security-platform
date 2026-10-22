import { createFileRoute } from "@tanstack/react-router";
import { authenticateWorker } from "@/lib/worker-auth.server";

interface InFinding {
  title?: string; severity?: string; cvss?: number | string; cwe?: string; location?: string;
  impact?: string; proof?: string; fix_diff?: string;
}
const SEV = ["critical", "high", "medium", "low"];
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.slice(0, n) : null);

export const Route = createFileRoute("/api/public/worker/result")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const fail = authenticateWorker(request);
        if (fail) return fail;
        let body: { id?: string; status?: string; error?: string; report?: string; findings?: InFinding[] };
        try { body = await request.json(); } catch { return Response.json({ error: "JSON inválido" }, { status: 400 }); }
        if (!body.id || !/^[0-9a-f-]{36}$/i.test(body.id)) return Response.json({ error: "id inválido" }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: p } = await supabaseAdmin.from("pentests").select("id,user_id,status,engine").eq("id", body.id).maybeSingle();
        if (!p || p.engine !== "strix" || p.status !== "running") return Response.json({ error: "Job não está em execução" }, { status: 409 });

        if (body.status === "failed") {
          await supabaseAdmin.from("pentests").update({ status: "failed", error: clip(body.error, 500), finished_at: new Date().toISOString() }).eq("id", p.id);
          return Response.json({ ok: true });
        }

        const list = (body.findings ?? []).slice(0, 500).map((f) => {
          const sev = SEV.includes(String(f.severity).toLowerCase()) ? String(f.severity).toLowerCase() : "medium";
          const cvss = Math.min(10, Math.max(0, Number(f.cvss) || 0));
          return {
            user_id: p.user_id, pentest_id: p.id, source: "strix", severity: sev, cvss,
            title: clip(f.title, 300) ?? "Vulnerabilidade", cwe: clip(f.cwe, 40), location: clip(f.location, 500),
            impact: clip(f.impact, 4000), proof: clip(f.proof, 8000), fix_diff: clip(f.fix_diff, 8000),
          };
        });
        if (list.length) {
          const { error } = await supabaseAdmin.from("findings").insert(list);
          if (error) return Response.json({ error: error.message }, { status: 500 });
        }
        const n = (s: string) => list.filter((f) => f.severity === s).length;
        await supabaseAdmin.from("pentests").update({
          status: "completed", critical: n("critical"), high: n("high"), medium: n("medium"), low: n("low"),
          report: clip(body.report, 200000), finished_at: new Date().toISOString(),
        }).eq("id", p.id);
        return Response.json({ ok: true, findings: list.length });
      },
    },
  },
});
