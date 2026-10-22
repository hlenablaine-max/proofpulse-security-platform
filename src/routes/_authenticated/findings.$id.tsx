import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Diff, Panel, Status, btnOutline, btnSolid, sevLabel, type Sev } from "@/components/app/ui";

export const Route = createFileRoute("/_authenticated/findings/$id")({
  head: () => ({ meta: [{ title: "Achado — Descrypted" }] }),
  component: Finding,
});

function Finding() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: f } = useQuery({
    queryKey: ["finding", id],
    queryFn: async () => (await supabase.from("findings").select("*").eq("id", id).single()).data,
  });

  async function markFixed() {
    const { error } = await supabase.from("findings").update({ status: "fixed" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Marcado como corrigido.");
    qc.invalidateQueries();
  }
  async function copyFix() {
    await navigator.clipboard.writeText(f?.fix_diff ?? "");
    toast.success("Correção copiada.");
  }

  if (!f) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  return (
    <div className="max-w-4xl">
      <Link to="/findings" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} />Achados</Link>
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-xs text-subtle">{f.cwe} · {f.source === "deep" ? "Agente Descrypted — evidência conferida no registro de requisições" : "Verificação básica — observação de configuração"}</p>
            <h1 className="mt-1 text-lg font-semibold">{f.title}</h1>
          </div>
          <div className="flex gap-2"><Badge sev={f.severity as Sev}>{sevLabel[f.severity]}</Badge><Badge sev={f.severity as Sev}>CVSS {f.cvss}</Badge><Status value={f.status} /></div>
        </div>
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <dl className="space-y-4 text-sm">
            <div><dt className="text-xs text-subtle">Impacto</dt><dd className="mt-1 text-muted-foreground">{f.impact}</dd></div>
            <div><dt className="text-xs text-subtle">Localização</dt><dd className="mt-1 font-mono text-xs">{f.location}</dd></div>
            {f.proof && <div><dt className="text-xs text-subtle">Prova</dt><dd className="mt-1"><Diff text={f.proof} /></dd></div>}
          </dl>
          {f.fix_diff && <div><p className="mb-2 text-xs text-subtle">Correção sugerida</p><Diff text={f.fix_diff} /></div>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          {f.status === "fixed" ? (
            <span className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-success" />Marcado como corrigido. Execute um novo pentest para confirmar.</span>
          ) : (
            <span className="text-sm text-muted-foreground">Aplique a correção e execute um novo pentest para confirmar.</span>
          )}
          <span className="flex gap-2">
            {f.fix_diff && <button onClick={copyFix} className={btnOutline}>Copiar correção</button>}
            {f.status !== "fixed" && <button onClick={markFixed} className={btnSolid}>Marcar como corrigido</button>}
          </span>
        </div>
      </Panel>
    </div>
  );
}
