import { createFileRoute } from "@tanstack/react-router";
import {
  Globe, GitPullRequest, Cloud, ShieldCheck, Ban, Radar, Zap, Brain, RefreshCw,
  Activity, CheckCircle2, Wrench, Server, Network, Lock, Headphones, Scale, ArrowRight,
} from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Descrypted — Pentest autônomo contínuo" },
      { name: "description", content: "Proteja todo o seu stack com pentest autônomo. Encontre e corrija vulnerabilidades 24/7, a cada deploy." },
      { property: "og:title", content: "Descrypted — Pentest autônomo contínuo" },
      { property: "og:description", content: "Pentest autônomo para APIs, código e nuvem. Achados validados com prova e PR de correção pronto pra merge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Sev = "critical" | "high" | "medium" | "success" | "running";
const sevClass: Record<Sev, string> = {
  critical: "text-critical bg-critical/10 border-critical/30",
  high: "text-high bg-high/10 border-high/30",
  medium: "text-medium bg-medium/10 border-medium/30",
  success: "text-success bg-success/10 border-success/30",
  running: "text-running bg-running/10 border-running/30",
};
function Badge({ sev, children }: { sev: Sev; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[11px] ${sevClass[sev]}`}>{children}</span>;
}
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-card ${className}`}>{children}</div>;
}
function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`mx-auto max-w-6xl px-5 py-24 md:py-32 ${className}`}>{children}</section>;
}
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">{children}</p>;
}
function H2({ children }: { children: ReactNode }) {
  return <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">{children}</h2>;
}
const btnSolid = "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90";
const btnOutline = "inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent";

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <a href="#" className="text-base font-bold tracking-tight">Descrypted</a>
        <nav className="hidden gap-7 text-sm text-muted-foreground md:flex">
          <a href="#produto" className="hover:text-foreground">Produto</a>
          <a href="#enterprise" className="hover:text-foreground">Enterprise</a>
          <a href="#blog" className="hover:text-foreground">Blog</a>
          <a href="#precos" className="hover:text-foreground">Preços</a>
        </nav>
        <div className="flex gap-2">
          <a href="#cta" className={`${btnOutline} hidden sm:inline-flex`}>Demo</a>
          <a href="#cta" className={btnSolid}>Começar teste</a>
        </div>
      </div>
    </header>
  );
}

const logos = ["Nubank", "iFood", "Stone", "PicPay", "QuintoAndar", "Creditas", "Ebanx", "VTEX"];

function Hero() {
  return (
    <Section className="pt-24 text-center md:pt-36">
      <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-7xl">
        Segurança contínua.<br /><span className="text-muted-foreground">A cada deploy.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
        Proteja todo o seu stack com pentest autônomo. Encontre e corrija vulnerabilidades 24/7.
      </p>
      <div className="mt-9"><a href="#cta" className={btnSolid}>Começar teste</a></div>
      <p className="mt-20 text-xs text-subtle">Usado por times de segurança em</p>
      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
        {logos.map((l) => (
          <span key={l} className="text-lg font-semibold tracking-tight text-subtle">{l}</span>
        ))}
      </div>
    </Section>
  );
}

const pentests: { target: string; status: [Sev, string]; issues: ReactNode; date: string }[] = [
  { target: "api.empresa.com", status: ["success", "Concluído"], issues: <><Badge sev="critical">3 críticos</Badge> <Badge sev="high">7 altos</Badge></>, date: "há 2h" },
  { target: "staging.app.io", status: ["running", "Rodando"], issues: <span className="text-subtle">—</span>, date: "agora" },
  { target: "checkout.loja.com.br", status: ["success", "Concluído"], issues: <Badge sev="medium">2 médios</Badge>, date: "ontem" },
  { target: "github.com/empresa/core", status: ["success", "Concluído"], issues: <Badge sev="high">1 alto</Badge>, date: "há 3 dias" },
];

function Dashboard() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-sm font-medium">Pentests</span>
        <span className="font-mono text-xs text-subtle">workspace / produção</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-subtle">
            <tr className="border-b border-border">
              {["Pentest", "Status", "Problemas", "Data"].map((h) => <th key={h} className="px-5 py-2.5 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {pentests.map((p) => (
              <tr key={p.target} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-mono text-xs">{p.target}</td>
                <td className="px-5 py-3"><Badge sev={p.status[0]}>{p.status[1]}</Badge></td>
                <td className="px-5 py-3">{p.issues}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">{children}</pre>;
}
const Del = ({ children }: { children: ReactNode }) => <span className="block text-critical">- {children}</span>;
const Add = ({ children }: { children: ReactNode }) => <span className="block text-success">+ {children}</span>;

function Block({ icon, title, desc, children }: { icon: ReactNode; title: string; desc: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col p-6">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-6 flex-1">{children}</div>
    </Card>
  );
}

function Product() {
  return (
    <Section id="produto">
      <Eyebrow>Produto</Eyebrow>
      <H2>Um agente de pentest para todo o stack.</H2>
      <p className="mt-4 max-w-xl text-muted-foreground">Execute testes sob demanda ou em cada deploy. Cada achado vem com reprodução, evidência e correção sugerida.</p>
      <div className="mt-12"><Dashboard /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Block icon={<Globe size={16} />} title="APIs e Web Apps" desc="Cobertura completa em REST, GraphQL e aplicações web, com prova de exploração para cada achado.">
          <div className="space-y-3 rounded-md border border-border p-3">
            <p className="text-sm font-medium">IDOR no endpoint de download de fatura</p>
            <div className="flex flex-wrap gap-2"><Badge sev="high">Alta</Badge><Badge sev="medium">CWE-639</Badge></div>
            <Code>
              <span className="block text-subtle">invoices.controller.ts</span>
              <Del>const inv = await db.invoice.find(id)</Del>
              <Add>const inv = await db.invoice.find(id, {"{"} userId {"}"})</Add>
              <Add>if (!inv) throw new ForbiddenError()</Add>
            </Code>
          </div>
        </Block>
        <Block icon={<GitPullRequest size={16} />} title="Código e Pull Requests" desc="Análise de código e PRs direto no pipeline de CI. A vulnerabilidade é identificada na origem.">
          <div className="space-y-2 rounded-md border border-border p-3 text-xs">
            <div className="flex items-center justify-between"><span className="font-mono">#482 feat: export csv</span><Badge sev="critical">Bloqueado</Badge></div>
            <p className="text-muted-foreground">SQL injection em <span className="font-mono">reports/export.ts:57</span></p>
            <div className="flex items-center justify-between border-t border-border pt-2"><span className="font-mono">#481 fix: session ttl</span><Badge sev="success">Aprovado</Badge></div>
            <div className="flex items-center justify-between"><span className="font-mono">#480 chore: deps</span><Badge sev="success">Aprovado</Badge></div>
          </div>
        </Block>
        <Block icon={<Cloud size={16} />} title="Infraestrutura e Nuvem" desc="Identifica configurações incorretas e exposições antes de um atacante.">
          <div className="divide-y divide-border rounded-md border border-border text-xs">
            {[["Bucket S3 público", "9.8"], ["Política IAM com wildcard", "9.1"], ["Security group 0.0.0.0/0:22", "7.5"]].map(([n, s], i) => (
              <div key={n} className="flex items-center justify-between gap-2 p-2.5">
                <span>{n}</span>
                <span className="flex items-center gap-2"><Badge sev={i < 2 ? "critical" : "high"}>{i < 2 ? "Crítico" : "Alto"}</Badge><span className="font-mono text-muted-foreground">{s}</span></span>
              </div>
            ))}
          </div>
        </Block>
      </div>
    </Section>
  );
}

function Testimonial() {
  return (
    <Section className="border-y border-border">
      <blockquote className="mx-auto max-w-3xl text-center">
        <p className="text-xl font-medium leading-relaxed md:text-3xl">
          “Reduzimos o tempo entre detecção e correção de semanas para horas. Os achados chegam reproduzidos, sem falso positivo para triar.”
        </p>
        <footer className="mt-8 text-sm text-muted-foreground">
          <span className="text-foreground">Mariana Albuquerque</span> · Head de Segurança, Trilha Pagamentos
        </footer>
      </blockquote>
    </Section>
  );
}

function Flow() {
  const steps = [
    ["01", "Encontrado", "O agente mapeia a superfície e identifica o vetor."],
    ["02", "Reproduzido", "A exploração é executada e registrada como prova."],
    ["03", "Corrigido", "Um PR com a correção é aberto e validado novamente."],
  ];
  return (
    <Section>
      <Eyebrow>Do achado à correção</Eyebrow>
      <H2>Cada vulnerabilidade termina em um PR.</H2>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {steps.map(([n, t, d]) => (
          <Card key={n} className="p-5">
            <span className="font-mono text-xs text-subtle">{n}</span>
            <p className="mt-2 font-semibold">{t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-xs text-subtle">DSC-1042</p>
            <p className="mt-1 font-semibold">Bypass de autorização em /api/v2/invoices/:id/download</p>
          </div>
          <div className="flex gap-2"><Badge sev="high">Alta</Badge><Badge sev="high">CVSS 8.1</Badge></div>
        </div>
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <dl className="space-y-4 text-sm">
            <div><dt className="text-xs text-subtle">Impacto</dt><dd className="mt-1 text-muted-foreground">Qualquer usuário autenticado pode baixar faturas de outros clientes alterando o ID sequencial.</dd></div>
            <div><dt className="text-xs text-subtle">Localização</dt><dd className="mt-1 font-mono text-xs">src/billing/invoices.controller.ts:42</dd></div>
            <div><dt className="text-xs text-subtle">Prova</dt><dd className="mt-1"><Code>GET /api/v2/invoices/10293/download{"\n"}Authorization: Bearer &lt;user_b&gt;{"\n"}→ 200 OK  application/pdf (fatura de user_a)</Code></dd></div>
          </dl>
          <div>
            <p className="mb-2 text-xs text-subtle">Correção sugerida</p>
            <Code>
              <span className="block text-subtle">@@ -40,6 +40,9 @@ export async function download(req, res)</span>
              <span className="block">  const {"{"} id {"}"} = req.params</span>
              <Del>const invoice = await Invoice.findById(id)</Del>
              <Add>const invoice = await Invoice.findOne({"{"}</Add>
              <Add>  id, ownerId: req.user.id,</Add>
              <Add>{"}"})</Add>
              <Add>if (!invoice) return res.sendStatus(404)</Add>
              <span className="block">  return res.pdf(invoice.file)</span>
            </Code>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <span className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-success" />Verificação confirmada — vulnerabilidade não é mais explorável</span>
          <a href="#cta" className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"><GitPullRequest size={14} />PR #517 pronto pra merge <ArrowRight size={12} /></a>
        </div>
      </Card>
    </Section>
  );
}

function Grid6() {
  const items: [ReactNode, string, string][] = [
    [<GitPullRequest size={16} />, "Toda PR revisada antes do merge", "Análise automática em cada pull request."],
    [<Ban size={16} />, "Bloqueia deploy com vulnerabilidade", "Gate configurável por severidade no CI."],
    [<Radar size={16} />, "Monitora a superfície de ataque", "Novos ativos e endpoints detectados continuamente."],
    [<Zap size={16} />, "Validação em tempo real", "Cada achado acompanha prova de exploração."],
    [<Brain size={16} />, "Pentest consciente do contexto", "Entende stack, arquitetura e lógica de negócio."],
    [<RefreshCw size={16} />, "Aprendizado contínuo", "Conhecimento acumulado entre execuções."],
  ];
  return (
    <Section>
      <Eyebrow>Deploy com confiança</Eyebrow>
      <H2>Segurança integrada ao ciclo de entrega.</H2>
      <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([i, t, d]) => (
          <div key={t} className="bg-background p-6">
            <span className="text-muted-foreground">{i}</span>
            <p className="mt-4 font-medium">{t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Features() {
  return (
    <Section id="precos">
      <Eyebrow>Recursos</Eyebrow>
      <H2>Visibilidade, evidência e correção.</H2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <Activity size={16} className="text-muted-foreground" />
          <p className="mt-4 font-semibold">Postura de segurança em tempo real</p>
          <div className="mt-6 flex h-24 items-end gap-1.5">
            {[70, 64, 58, 52, 40, 34, 22, 18, 12, 8].map((h, i) => <div key={i} className="flex-1 rounded-sm bg-muted" style={{ height: `${h}%` }} />)}
          </div>
          <p className="mt-2 font-mono text-[11px] text-subtle">Vulnerabilidades abertas · 30 dias</p>
        </Card>
        <Card className="p-6">
          <CheckCircle2 size={16} className="text-muted-foreground" />
          <p className="mt-4 font-semibold">Achados validados com prova</p>
          <div className="mt-6 space-y-2 text-xs">
            {["SSRF em /webhooks/test", "JWT sem verificação de alg", "XSS armazenado em comentários"].map((t) => (
              <div key={t} className="flex items-center justify-between rounded border border-border p-2"><span>{t}</span><Badge sev="success">Validado</Badge></div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <Wrench size={16} className="text-muted-foreground" />
          <p className="mt-4 font-semibold">Correção automática com PR</p>
          <div className="mt-6 space-y-2 rounded border border-border p-3 font-mono text-[11px]">
            <p>descrypted-bot abriu #517</p>
            <p className="text-muted-foreground">fix(billing): enforce ownership check</p>
            <p><span className="text-success">+4</span> <span className="text-critical">−1</span> · checks passando</p>
          </div>
        </Card>
      </div>
    </Section>
  );
}

function Enterprise() {
  const items: [ReactNode, string, string][] = [
    [<Server size={16} />, "Deploy self-hosted", "Execução na sua VPC ou on-premise."],
    [<Network size={16} />, "Infraestrutura interna", "Testes em redes internas, não apenas na superfície externa."],
    [<Lock size={16} />, "Retenção zero de dados", "Seu código nunca é usado para treinar modelos."],
    [<Headphones size={16} />, "Suporte e conformidade", "SLA customizado, suporte dedicado, LGPD, ISO 27001 e SOC 2."],
  ];
  return (
    <Section id="enterprise" className="border-t border-border">
      <Eyebrow>Enterprise</Eyebrow>
      <H2>Para ambientes com requisitos rígidos.</H2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {items.map(([i, t, d]) => (
          <Card key={t} className="flex gap-4 p-6">
            <span className="mt-0.5 text-muted-foreground">{i}</span>
            <div><p className="font-medium">{t}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Ethics() {
  const items = [
    ["Autorização obrigatória", "Testes só são executados após verificação de propriedade do domínio, repositório ou conta de nuvem (DNS TXT, OAuth ou role IAM)."],
    ["Escopo explícito", "Alvos, janelas de execução e técnicas permitidas são definidos antes de cada pentest. Nada fora do escopo é tocado."],
    ["Exploração não destrutiva", "Provas de conceito são mínimas: sem exfiltração de dados reais, sem negação de serviço, sem persistência."],
    ["Conformidade legal", "Operação alinhada à Lei 12.737/2012, ao Marco Civil da Internet e à LGPD. Logs completos de auditoria por execução."],
  ];
  return (
    <Section className="border-t border-border">
      <div className="flex items-center gap-2"><Scale size={14} className="text-muted-foreground" /><Eyebrow>Legalidade e ética</Eyebrow></div>
      <H2>Teste apenas o que você tem permissão para testar.</H2>
      <p className="mt-4 max-w-xl text-muted-foreground">A Descrypted segue princípios de hacking ético. Uso contra sistemas de terceiros sem autorização é bloqueado e viola os termos de serviço.</p>
      <div className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {items.map(([t, d]) => (
          <div key={t} className="border-l border-border pl-5"><p className="font-medium">{t}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
        ))}
      </div>
    </Section>
  );
}

function Blog() {
  const posts = [
    ["Pesquisa", "Encadeando IDORs em APIs GraphQL", "12 out 2026"],
    ["Engenharia", "Como validamos exploits sem efeitos colaterais", "28 set 2026"],
    ["Produto", "Gate de segurança no CI: configuração e métricas", "09 set 2026"],
  ];
  return (
    <Section id="blog" className="border-t border-border">
      <Eyebrow>Blog</Eyebrow>
      <H2>Publicações recentes.</H2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {posts.map(([c, t, d]) => (
          <a key={t} href="#blog" className="group">
            <Card className="h-full p-6 transition-colors group-hover:bg-accent">
              <p className="font-mono text-xs text-subtle">{c}</p>
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-8 text-xs text-muted-foreground">{d}</p>
            </Card>
          </a>
        ))}
      </div>
    </Section>
  );
}

function CTA() {
  return (
    <Section id="cta" className="border-t border-border text-center">
      <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">Teste sua aplicação hoje.</h2>
      <p className="mt-4 text-muted-foreground">Configuração em minutos, resultado instantâneo.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a href="#" className={btnSolid}>Rodar um pentest</a>
        <a href="#precos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">Ver preços <ArrowRight size={14} /></a>
      </div>
    </Section>
  );
}

function Footer() {
  const cols: [string, string[]][] = [
    ["Produto", ["APIs e Web Apps", "Código e PRs", "Infraestrutura e Nuvem", "Correção automática", "Enterprise"]],
    ["Empresa", ["Blog", "Carreiras", "Contato", "Suporte"]],
    ["Comunidade", ["Discord", "GitHub"]],
    ["Ferramentas", ["Calculadora CVSS", "Buscador de CWE", "Verificador de headers"]],
  ];
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div><p className="font-bold">Descrypted</p><p className="mt-2 text-sm text-muted-foreground">Pentest autônomo contínuo.</p></div>
          {cols.map(([t, ls]) => (
            <div key={t}>
              <p className="text-sm font-medium">{t}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">{ls.map((l) => <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success" />Todos os sistemas operacionais</span>
          <div className="flex gap-2">
            {["SOC 2 Type II", "ISO 27001", "LGPD"].map((b) => <span key={b} className="flex items-center gap-1 rounded border border-border px-2 py-1"><ShieldCheck size={12} />{b}</span>)}
          </div>
          <span>© 2026 Descrypted Tecnologia Ltda.</span>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Product />
        <Testimonial />
        <Flow />
        <Grid6 />
        <Features />
        <Enterprise />
        <Ethics />
        <Blog />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
