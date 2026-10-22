import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GitPullRequest } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Panel, PageHeader, Status, ago } from "@/components/app/ui";

export const Route = createFileRoute("/_authenticated/pull-requests")({
  head: () => ({ meta: [{ title: "PR reviews — Descrypted" }] }),
  component: PRs,
});

function PRs() {
  const { data = [] } = useQuery({
    queryKey: ["prs"],
    queryFn: async () => (await supabase.from("pr_reviews").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div>
      <PageHeader title="PR security reviews" desc="Toda pull request é analisada antes do merge. PRs com vulnerabilidade bloqueiam o deploy." />
      <Panel className="divide-y divide-border">
        {data.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-start gap-3">
              <GitPullRequest size={16} className="mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="mt-1 font-mono text-xs text-subtle">{p.repo}#{p.number} · {p.author} · {ago(p.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {p.issues > 0 && <span className="text-xs text-muted-foreground">{p.issues} problema(s)</span>}
              <Status value={p.status} />
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}
