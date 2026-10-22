import type { ReactNode } from "react";

export type Sev = "critical" | "high" | "medium" | "low" | "none" | "success" | "running" | "pending";
const cls: Record<Sev, string> = {
  critical: "text-critical bg-critical/10 border-critical/30",
  high: "text-high bg-high/10 border-high/30",
  medium: "text-medium bg-medium/10 border-medium/30",
  low: "text-muted-foreground bg-muted border-border",
  none: "text-muted-foreground bg-muted border-border",
  success: "text-success bg-success/10 border-success/30",
  running: "text-running bg-running/10 border-running/30",
  pending: "text-muted-foreground bg-muted border-border",
};
export const sevLabel: Record<string, string> = {
  critical: "Crítico", high: "Alto", medium: "Médio", low: "Baixo", none: "Nenhuma",
};
export const statusMap: Record<string, [Sev, string]> = {
  completed: ["success", "Concluído"],
  running: ["running", "Rodando"],
  scheduled: ["pending", "Agendado"],
  open: ["high", "Aberto"],
  fixed: ["success", "Corrigido"],
  approved: ["success", "Aprovado"],
  blocked: ["critical", "Bloqueado"],
  pending: ["pending", "Em análise"],
};
export const scheduleLabel: Record<string, string> = { daily: "Diário", weekly: "Semanal", monthly: "Mensal" };

export function Badge({ sev, children }: { sev: Sev; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[11px] ${cls[sev] ?? cls.none}`}>{children}</span>;
}
export function Status({ value }: { value: string }) {
  const [s, l] = statusMap[value] ?? ["pending", value];
  return <Badge sev={s}>{l}</Badge>;
}
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-card ${className}`}>{children}</div>;
}
export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
export function Diff({ text }: { text: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
      {text.split("\n").map((l, i) => (
        <span key={i} className={`block ${l.startsWith("+") ? "text-success" : l.startsWith("-") ? "text-critical" : ""}`}>{l}</span>
      ))}
    </pre>
  );
}
export function ago(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)}h`;
  return `há ${Math.floor(s / 86400)} d`;
}
export const btnSolid = "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50";
export const btnOutline = "inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50";
export const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-subtle focus:border-ring";
