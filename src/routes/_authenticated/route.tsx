import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Crosshair, Bug, GitPullRequest, Radar, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { to: "/pentests", label: "Pentests", icon: Crosshair },
  { to: "/findings", label: "Achados", icon: Bug },
  { to: "/pull-requests", label: "PR reviews", icon: GitPullRequest },
  { to: "/surface", label: "Superfície", icon: Radar },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

function AppLayout() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-border md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:border-b-0 md:border-r">
        <div className="flex h-14 items-center justify-between px-5">
          <Link to="/dashboard" className="font-bold tracking-tight">Descrypted</Link>
          <button onClick={signOut} className="text-muted-foreground md:hidden" aria-label="Sair"><LogOut size={16} /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" activeProps={{ className: "bg-accent text-foreground" }}>
              <n.icon size={15} />{n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-border p-4 md:block">
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <button onClick={signOut} className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><LogOut size={14} />Sair</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10"><Outlet /></main>
    </div>
  );
}
