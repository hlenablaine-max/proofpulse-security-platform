import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Panel, PageHeader, ago, sevLabel, type Sev } from "@/components/app/ui";

export const Route = createFileRoute("/_authenticated/surface")({
  head: () => ({ meta: [{ title: "Superfície de ataque — Descrypted" }] }),
  component: Surface,
});

function Surface() {
  const { data = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => (await supabase.from("assets").select("*").order("last_seen", { ascending: false })).data ?? [],
  });
  return (
    <div>
      <PageHeader title="Superfície de ataque" desc="Ativos descobertos e monitorados continuamente." />
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="text-left text-xs text-subtle">
            <tr className="border-b border-border">{["Ativo", "Tipo", "Exposição", "Observação", "Visto"].map((h) => <th key={h} className="px-5 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-mono text-xs">{a.host}</td>
                <td className="px-5 py-3 text-muted-foreground">{a.kind}</td>
                <td className="px-5 py-3"><Badge sev={a.exposure as Sev}>{sevLabel[a.exposure]}</Badge></td>
                <td className="px-5 py-3 text-muted-foreground">{a.note}</td>
                <td className="px-5 py-3 text-muted-foreground">{ago(a.last_seen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
