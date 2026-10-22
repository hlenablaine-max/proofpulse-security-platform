// Scanner leve e passivo: apenas requisições GET/HEAD de baixo impacto.
// Não explora vulnerabilidades, não faz brute force e não envia payloads.

export type Sev = "critical" | "high" | "medium" | "low";
export interface ScanFinding {
  title: string;
  severity: Sev;
  cvss: number;
  cwe: string;
  location: string;
  impact: string;
  proof: string;
  fix_diff: string;
}

const TIMEOUT = 8000;
const UA = "Descrypted-Scanner/1.0 (+passive; authorized testing only)";

export function normalizeTarget(input: string): { host: string; url: string } {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("Alvo inválido. Informe um domínio ou URL, ex.: app.suaempresa.com");
  }
  const host = u.hostname.toLowerCase();
  if (!host.includes(".") || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Alvo inválido: apenas domínios públicos podem ser testados.");
  }
  if (isPrivateIp(host)) throw new Error("Alvo inválido: endereços privados ou reservados não são permitidos.");
  return { host, url: `https://${host}${u.port && u.port !== "443" ? ":" + u.port : ""}` };
}

function isPrivateIp(ip: string): boolean {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    const [a = 0, b = 0] = ip.split(".").map(Number);
    return (
      a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || a >= 224
    );
  }
  if (ip.includes(":")) {
    const l = ip.toLowerCase();
    return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:");
  }
  return false;
}

async function doh(name: string, type: string): Promise<string[]> {
  try {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    const j = (await r.json()) as { Answer?: { data: string }[] };
    return (j.Answer ?? []).map((a) => a.data);
  } catch {
    return [];
  }
}

async function get(url: string, init: RequestInit = {}) {
  return fetch(url, {
    redirect: "manual",
    ...init,
    headers: { "user-agent": UA, ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT),
  });
}

async function head2k(res: Response): Promise<string> {
  try {
    const reader = res.body?.getReader();
    if (!reader) return "";
    const { value } = await reader.read();
    await reader.cancel();
    return value ? new TextDecoder().decode(value.slice(0, 2048)) : "";
  } catch {
    return "";
  }
}

const SEC_HEADERS: { name: string; sev: Sev; cvss: number; cwe: string; title: string; impact: string; fix: string }[] = [
  { name: "strict-transport-security", sev: "medium", cvss: 5.9, cwe: "CWE-319", title: "Header HSTS ausente",
    impact: "Navegadores podem ser induzidos a usar HTTP, expondo sessões a interceptação (downgrade).",
    fix: "+ Strict-Transport-Security: max-age=31536000; includeSubDomains" },
  { name: "content-security-policy", sev: "medium", cvss: 5.3, cwe: "CWE-693", title: "Content-Security-Policy ausente",
    impact: "Sem CSP, o impacto de uma falha de XSS é maior: scripts de qualquer origem podem executar.",
    fix: "+ Content-Security-Policy: default-src 'self'; frame-ancestors 'none'" },
  { name: "x-content-type-options", sev: "low", cvss: 3.7, cwe: "CWE-693", title: "X-Content-Type-Options ausente",
    impact: "O navegador pode interpretar arquivos com tipo MIME diferente do declarado (MIME sniffing).",
    fix: "+ X-Content-Type-Options: nosniff" },
  { name: "referrer-policy", sev: "low", cvss: 3.1, cwe: "CWE-200", title: "Referrer-Policy ausente",
    impact: "URLs internas podem vazar no header Referer para sites de terceiros.",
    fix: "+ Referrer-Policy: strict-origin-when-cross-origin" },
  { name: "permissions-policy", sev: "low", cvss: 2.6, cwe: "CWE-693", title: "Permissions-Policy ausente",
    impact: "Recursos do navegador (câmera, geolocalização) não são restringidos para o site e iframes.",
    fix: "+ Permissions-Policy: camera=(), microphone=(), geolocation=()" },
];

const EXPOSED: { path: string; test: (b: string) => boolean; title: string; sev: Sev; cvss: number; cwe: string; fix: string }[] = [
  { path: "/.env", test: (b) => /^[A-Z][A-Z0-9_]{2,}\s*=/m.test(b) && !/<html/i.test(b),
    title: "Arquivo .env acessível publicamente", sev: "critical", cvss: 9.8, cwe: "CWE-538",
    fix: "+ location ~ /\\.(?!well-known) { deny all; }\n# Rotacione todas as credenciais do arquivo." },
  { path: "/.git/HEAD", test: (b) => /^ref:\s*refs\//.test(b.trim()),
    title: "Repositório .git exposto", sev: "critical", cvss: 9.1, cwe: "CWE-538",
    fix: "+ location ~ /\\.git { deny all; }\n# Remova o diretório .git do servidor web." },
  { path: "/.git/config", test: (b) => /\[core\]/.test(b),
    title: "Configuração .git/config acessível", sev: "high", cvss: 7.5, cwe: "CWE-538",
    fix: "+ location ~ /\\.git { deny all; }" },
  { path: "/phpinfo.php", test: (b) => /PHP Version/i.test(b),
    title: "phpinfo() exposto", sev: "medium", cvss: 5.3, cwe: "CWE-200", fix: "- phpinfo.php\n# Remova o arquivo de produção." },
  { path: "/server-status", test: (b) => /Apache Server Status/i.test(b),
    title: "Apache server-status exposto", sev: "medium", cvss: 5.3, cwe: "CWE-200",
    fix: "+ <Location /server-status>\n+   Require local\n+ </Location>" },
  { path: "/.DS_Store", test: (b) => b.startsWith("\u0000\u0000\u0000\u0001Bud1"),
    title: "Arquivo .DS_Store exposto", sev: "low", cvss: 3.7, cwe: "CWE-538", fix: "# Remova .DS_Store do deploy" },
];

export async function runLightScan(inputTarget: string): Promise<{ findings: ScanFinding[]; log: string[]; host: string }> {
  const { host, url } = normalizeTarget(inputTarget);
  const findings: ScanFinding[] = [];
  const log: string[] = [];

  // Resolve DNS e bloqueia destinos privados (anti-SSRF)
  const a = await doh(host, "A");
  const aaaa = await doh(host, "AAAA");
  const ips = [...a, ...aaaa].filter((x) => /^[\d.]+$|:/.test(x));
  if (ips.length === 0) throw new Error(`Não foi possível resolver o domínio ${host}.`);
  if (ips.some(isPrivateIp)) throw new Error("O domínio resolve para um endereço privado; teste bloqueado.");
  log.push(`DNS: ${ips.join(", ")}`);

  // Requisição principal
  let main: Response;
  try {
    main = await get(url + "/");
  } catch {
    throw new Error(`Não foi possível conectar a ${url} via HTTPS.`);
  }
  const h = main.headers;
  log.push(`GET ${url}/ → ${main.status}`);

  for (const s of SEC_HEADERS) {
    const present = s.name === "content-security-policy" ? h.get(s.name) || h.get("content-security-policy-report-only") : h.get(s.name);
    if (!present) {
      findings.push({ title: s.title, severity: s.sev, cvss: s.cvss, cwe: s.cwe, location: `${url}/ (header de resposta)`,
        impact: s.impact, proof: `GET ${url}/\n→ ${main.status}, sem o header ${s.name}`, fix_diff: s.fix });
    }
  }
  if (!h.get("x-frame-options") && !/frame-ancestors/i.test(h.get("content-security-policy") ?? "")) {
    findings.push({ title: "Proteção contra clickjacking ausente", severity: "medium", cvss: 4.3, cwe: "CWE-1021", location: `${url}/ (header de resposta)`,
      impact: "O site pode ser embutido em iframes de terceiros para enganar usuários a clicar em ações indesejadas.",
      proof: `GET ${url}/\n→ sem X-Frame-Options e sem frame-ancestors`, fix_diff: "+ X-Frame-Options: DENY" });
  }

  const server = h.get("server") ?? "";
  const powered = h.get("x-powered-by") ?? "";
  if (/\d+\.\d+/.test(server) || powered) {
    findings.push({ title: "Divulgação de versão de tecnologia", severity: "low", cvss: 3.1, cwe: "CWE-200", location: `${url}/ (headers)`,
      impact: "Versões expostas facilitam a busca por vulnerabilidades conhecidas (CVE) específicas.",
      proof: `Server: ${server || "-"}\nX-Powered-By: ${powered || "-"}`,
      fix_diff: "+ server_tokens off;   # nginx\n+ ServerTokens Prod    # apache\n- X-Powered-By: " + (powered || "...") });
  }

  // Cookies
  const cookies: string[] = typeof (h as unknown as { getSetCookie?: () => string[] }).getSetCookie === "function"
    ? (h as unknown as { getSetCookie: () => string[] }).getSetCookie()
    : [];
  for (const c of cookies) {
    const name = c.split("=")[0];
    const miss = [!/;\s*secure/i.test(c) && "Secure", !/;\s*httponly/i.test(c) && "HttpOnly", !/;\s*samesite/i.test(c) && "SameSite"].filter(Boolean) as string[];
    if (miss.length) {
      findings.push({ title: `Cookie "${name}" sem flags de segurança`, severity: "medium", cvss: 4.8, cwe: "CWE-614", location: `${url}/ (Set-Cookie)`,
        impact: `Faltam os atributos ${miss.join(", ")}, aumentando o risco de roubo de sessão por XSS ou rede insegura.`,
        proof: `Set-Cookie: ${name}=…; (sem ${miss.join(", ")})`, fix_diff: `+ Set-Cookie: ${name}=…; Secure; HttpOnly; SameSite=Lax` });
    }
  }

  // HTTP -> HTTPS
  try {
    const r = await get(`http://${host}/`);
    const loc = r.headers.get("location") ?? "";
    if (!(r.status >= 300 && r.status < 400 && loc.startsWith("https://"))) {
      findings.push({ title: "HTTP não redireciona para HTTPS", severity: "medium", cvss: 5.9, cwe: "CWE-319", location: `http://${host}/`,
        impact: "Usuários que acessam via HTTP trafegam dados em texto claro.",
        proof: `GET http://${host}/\n→ ${r.status}${loc ? " Location: " + loc : ""}`, fix_diff: "+ return 301 https://$host$request_uri;" });
    }
    await r.body?.cancel();
  } catch {
    log.push("Porta 80 não respondeu");
  }

  // CORS
  try {
    const r = await get(url + "/", { headers: { origin: "https://origem-nao-confiavel.example" } });
    const acao = r.headers.get("access-control-allow-origin");
    const acac = r.headers.get("access-control-allow-credentials");
    if (acao && (acao === "https://origem-nao-confiavel.example" || acao === "*") && acac === "true") {
      findings.push({ title: "CORS permissivo com credenciais", severity: "high", cvss: 8.1, cwe: "CWE-942", location: `${url}/`,
        impact: "Qualquer site pode ler respostas autenticadas em nome do usuário.",
        proof: `Origin: https://origem-nao-confiavel.example\n→ Access-Control-Allow-Origin: ${acao}\n→ Access-Control-Allow-Credentials: true`,
        fix_diff: "- Access-Control-Allow-Origin: $http_origin\n+ # Use uma allowlist explícita de origens confiáveis" });
    }
    await r.body?.cancel();
  } catch { /* ignore */ }

  // Arquivos sensíveis expostos (GET simples, apenas primeiros 2KB)
  await Promise.all(EXPOSED.map(async (e) => {
    try {
      const r = await get(url + e.path);
      if (r.status === 200) {
        const body = await head2k(r);
        if (e.test(body)) {
          findings.push({ title: e.title, severity: e.sev, cvss: e.cvss, cwe: e.cwe, location: `${url}${e.path}`,
            impact: "Informações internas acessíveis a qualquer pessoa na internet.",
            proof: `GET ${url}${e.path}\n→ 200 OK (conteúdo compatível com o arquivo; valores omitidos)`, fix_diff: e.fix });
        }
      } else await r.body?.cancel();
    } catch { /* ignore */ }
  }));

  // security.txt
  try {
    const r = await get(url + "/.well-known/security.txt");
    if (r.status !== 200) {
      findings.push({ title: "security.txt não publicado", severity: "low", cvss: 0.0, cwe: "CWE-1059", location: `${url}/.well-known/security.txt`,
        impact: "Pesquisadores de segurança não têm um canal oficial para reportar vulnerabilidades.",
        proof: `GET ${url}/.well-known/security.txt\n→ ${r.status}`, fix_diff: "+ Contact: mailto:security@" + host.split(".").slice(-2).join(".") + "\n+ Expires: 2027-12-31T23:59:59Z" });
    }
    await r.body?.cancel();
  } catch { /* ignore */ }

  // E-mail: SPF / DMARC no domínio base
  const parts = host.split(".");
  const second = ["com", "net", "org", "gov", "edu"];
  const base = parts.length > 2 && second.includes(parts[parts.length - 2] ?? "") ? parts.slice(-3).join(".") : parts.slice(-2).join(".");
  const [txt, dmarc] = await Promise.all([doh(base, "TXT"), doh(`_dmarc.${base}`, "TXT")]);
  if (!dmarc.some((t) => /v=DMARC1/i.test(t))) {
    findings.push({ title: "DMARC não configurado", severity: "medium", cvss: 5.3, cwe: "CWE-290", location: `_dmarc.${base}`,
      impact: "O domínio pode ser falsificado em e-mails de phishing.", proof: `TXT _dmarc.${base} → sem registro v=DMARC1`,
      fix_diff: `+ _dmarc.${base}  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@${base}"` });
  }
  if (!txt.some((t) => /v=spf1/i.test(t))) {
    findings.push({ title: "SPF não configurado", severity: "low", cvss: 3.7, cwe: "CWE-290", location: base,
      impact: "Sem SPF, servidores de e-mail não conseguem validar remetentes legítimos do domínio.", proof: `TXT ${base} → sem registro v=spf1`,
      fix_diff: `+ ${base}  TXT  "v=spf1 include:_spf.seuprovedor.com -all"` });
  }

  const order: Record<Sev, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((x, y) => order[x.severity] - order[y.severity] || y.cvss - x.cvss);
  return { findings, log, host };
}
