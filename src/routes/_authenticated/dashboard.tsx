import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Panel, PageHeader, Status, ago, sevLabel, type Sev } from "@/components/app/ui";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Visão geral — Descrypted" }] }),
  component: Overview,
});

function Overview() {
  const { data } = useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const [f, p, pr, a] = await Promise.all([
        supabase.from("findings").select("id,title,severity,status,cvss,created_at").order("cvss", { ascending: false }),
        supabase.from("pentests").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("pr_reviews").select("status"),
        supabase.from("assets").select("exposure"),
      ]);
      return { findings: f.data ?? [], pentests: p.data ?? [], prs: pr.data ?? [], assets: a.data ?? [] };
    },
  });
  const findings = data?.findings ?? [];
  const open = findings.filter((f) => f.status === "open");
  const count = (s: string) => open.filter((f) => f.severity === s).length;
  const fixed = findings.length - open.length;
  const score = Math.max(0, 100 - count("critical") * 15 - count("high") * 7 - count("medium") * 2);

  return (
    <div>
      <PageHeader title="Visão geral" desc="Postura de segurança do workspace." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Score de postura" value={`${score}`} hint="de 100" />
        <Stat label="Críticos abertos" value={String(count("critical"))} sev="critical" />
        <Stat label="Altos abertos" value={String(count("high"))} sev="high" />
        <Stat label="Corrigidos" value={String(fixed)} sev="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="text-sm font-medium">Achados abertos por severidade</span>
            <Link to="/findings" className="text-xs text-muted-foreground hover:text-foreground">Ver todos</Link>
          </div>
          <div className="space-y-3 p-5">
            {(["critical", "high", "medium", "low"] as const).map((s) => {
              const n = count(s);
              const pct = open.length ? (n / open.length) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-16 text-muted-foreground">{sevLabel[s]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full bg-${s === "low" ? "subtle" : s}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-xs">{n}</span>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm font-medium">Cobertura</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="PRs revisadas" v={String(data?.prs.length ?? 0)} />
            <Row k="PRs bloqueadas" v={String(data?.prs.filter((p) => p.status === "blocked").length ?? 0)} />
            <Row k="Ativos monitorados" v={String(data?.assets.length ?? 0)} />
            <Row k="Ativos com exposição crítica" v={String(data?.assets.filter((a) => a.exposure === "critical").length ?? 0)} />
          </dl>
        </Panel>
      </div>

      <Panel className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-sm font-medium">Pentests recentes</span>
          <Link to="/pentests" className="text-xs text-muted-foreground hover:text-foreground">Ver todos</Link>
        </div>
        <div className="divide-y divide-border">
          {data?.pentests.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <span className="font-mono text-xs">{p.target}</span>
              <span className="flex items-center gap-3"><Status value={p.status} /><span className="text-xs text-muted-foreground">{ago(p.created_at)}</span></span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value, hint, sev }: { label: string; value: string; hint?: string; sev?: Sev }) {
  return (
    <Panel className="p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}{hint && <span className="ml-1 text-sm font-normal text-subtle">{hint}</span>}</p>
      {sev && <div className="mt-2"><Badge sev={sev}>{label.split(" ")[0]}</Badge></div>}
    </Panel>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="font-mono">{v}</dd></div>;
}
