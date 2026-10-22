import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Panel, PageHeader, Status, sevLabel, type Sev } from "@/components/app/ui";

export const Route = createFileRoute("/_authenticated/findings")({
  head: () => ({ meta: [{ title: "Achados — Descrypted" }] }),
  component: Findings,
});

function Findings() {
  const match = useMatchRoute();
  const [filter, setFilter] = useState<"all" | "open" | "fixed">("all");
  const { data = [] } = useQuery({
    queryKey: ["findings"],
    queryFn: async () => (await supabase.from("findings").select("id,title,severity,cvss,cwe,status,location").order("cvss", { ascending: false })).data ?? [],
  });
  if (match({ to: "/findings/$id" })) return <Outlet />;
  const rows = data.filter((f) => filter === "all" || f.status === filter);
  return (
    <div>
      <PageHeader title="Achados" desc="Vulnerabilidades validadas com prova de exploração." />
      <div className="mb-4 flex gap-2 text-sm">
        {(["all", "open", "fixed"] as const).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-md border px-3 py-1 ${filter === k ? "border-ring text-foreground" : "border-border text-muted-foreground"}`}>
            {{ all: "Todos", open: "Abertos", fixed: "Corrigidos" }[k]}
          </button>
        ))}
      </div>
      <Panel className="divide-y divide-border">
        {rows.map((f) => (
          <Link key={f.id} to="/findings/$id" params={{ id: f.id }} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-accent">
            <div className="min-w-0">
              <p className="text-sm font-medium">{f.title}</p>
              <p className="mt-1 truncate font-mono text-xs text-subtle">{f.location}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge sev={f.severity as Sev}>{sevLabel[f.severity]}</Badge>
              <Badge sev="none">CVSS {f.cvss}</Badge>
              <Status value={f.status} />
            </div>
          </Link>
        ))}
        {rows.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum achado.</p>}
      </Panel>
    </div>
  );
}
