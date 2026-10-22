create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.pentests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  target text not null,
  kind text not null default 'web',
  status text not null default 'running',
  schedule text,
  critical int not null default 0,
  high int not null default 0,
  medium int not null default 0,
  low int not null default 0,
  created_at timestamptz not null default now()
);
create table public.findings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  pentest_id uuid references public.pentests(id) on delete cascade,
  title text not null,
  severity text not null,
  cvss numeric(3,1) not null default 0,
  cwe text,
  location text,
  impact text,
  proof text,
  fix_diff text,
  status text not null default 'open',
  pr_number int,
  created_at timestamptz not null default now()
);
create table public.pr_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  repo text not null,
  number int not null,
  title text not null,
  author text,
  status text not null default 'pending',
  issues int not null default 0,
  created_at timestamptz not null default now()
);
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  host text not null,
  kind text not null,
  exposure text not null default 'none',
  note text,
  last_seen timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['pentests','findings','pr_reviews','assets'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own select" on public.%I for select to authenticated using (auth.uid() = user_id)', t);
    execute format('create policy "own insert" on public.%I for insert to authenticated with check (auth.uid() = user_id)', t);
    execute format('create policy "own update" on public.%I for update to authenticated using (auth.uid() = user_id)', t);
    execute format('create policy "own delete" on public.%I for delete to authenticated using (auth.uid() = user_id)', t);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare p1 uuid; p2 uuid;
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');

  insert into public.pentests (user_id, target, kind, status, schedule, critical, high, medium, created_at)
  values (new.id, 'api.empresa.com', 'api', 'completed', 'weekly', 1, 2, 1, now() - interval '2 hours') returning id into p1;
  insert into public.pentests (user_id, target, kind, status, created_at)
  values (new.id, 'staging.app.io', 'web', 'running', now());
  insert into public.pentests (user_id, target, kind, status, schedule, critical, high, medium, created_at)
  values (new.id, 'aws://conta-producao', 'cloud', 'completed', 'daily', 2, 0, 1, now() - interval '1 day') returning id into p2;

  insert into public.findings (user_id, pentest_id, title, severity, cvss, cwe, location, impact, proof, fix_diff) values
  (new.id, p1, 'IDOR no endpoint de download de fatura', 'high', 8.1, 'CWE-639', 'src/billing/invoices.controller.ts:42',
   'Usuário autenticado pode baixar faturas de outros clientes alterando o ID.',
   E'GET /api/v2/invoices/10293/download\nAuthorization: Bearer <user_b>\n→ 200 OK (fatura de user_a)',
   E'- const invoice = await Invoice.findById(id)\n+ const invoice = await Invoice.findOne({ id, ownerId: req.user.id })\n+ if (!invoice) return res.sendStatus(404)'),
  (new.id, p1, 'SQL injection em exportação de relatórios', 'critical', 9.4, 'CWE-89', 'src/reports/export.ts:57',
   'Leitura arbitrária do banco de dados via parâmetro sort.',
   E'GET /api/reports/export?sort=name;SELECT+pg_sleep(5)--\n→ resposta em 5.02s',
   E'- db.query(`SELECT * FROM reports ORDER BY ${sort}`)\n+ const col = ALLOWED_SORT.includes(sort) ? sort : ''created_at''\n+ db.query(''SELECT * FROM reports ORDER BY '' + db.ident(col))'),
  (new.id, p1, 'JWT aceita algoritmo none', 'high', 7.7, 'CWE-347', 'src/auth/verify.ts:12',
   'Tokens forjados sem assinatura são aceitos.', E'alg: none → 200 OK em /api/me',
   E'- jwt.verify(token, key)\n+ jwt.verify(token, key, { algorithms: [''RS256''] })'),
  (new.id, p1, 'Header CSP ausente', 'medium', 5.3, 'CWE-693', 'nginx.conf', 'Aumenta impacto de XSS.', 'Resposta sem Content-Security-Policy',
   E'+ add_header Content-Security-Policy "default-src ''self''";'),
  (new.id, p2, 'Bucket S3 público', 'critical', 9.8, 'CWE-732', 's3://empresa-backups', 'Backups listáveis e baixáveis anonimamente.',
   E'aws s3 ls s3://empresa-backups --no-sign-request\n→ 214 objetos', E'+ BlockPublicAcls: true\n+ RestrictPublicBuckets: true'),
  (new.id, p2, 'Política IAM com wildcard', 'critical', 9.1, 'CWE-269', 'iam/role/ci-deployer', 'Role de CI tem Action "*" em Resource "*".',
   'iam simulate-principal-policy → allowed: iam:CreateUser', E'- "Action": "*"\n+ "Action": ["s3:PutObject", "ecs:UpdateService"]');

  insert into public.pr_reviews (user_id, repo, number, title, author, status, issues, created_at) values
  (new.id, 'empresa/core', 482, 'feat: export csv', 'lucas.m', 'blocked', 1, now() - interval '20 minutes'),
  (new.id, 'empresa/core', 481, 'fix: session ttl', 'ana.r', 'approved', 0, now() - interval '3 hours'),
  (new.id, 'empresa/web', 219, 'chore: bump deps', 'renovate', 'approved', 0, now() - interval '5 hours'),
  (new.id, 'empresa/core', 483, 'feat: webhooks v2', 'pedro.s', 'pending', 0, now());

  insert into public.assets (user_id, host, kind, exposure, note) values
  (new.id, 'api.empresa.com', 'API', 'high', '3 portas abertas, TLS 1.2'),
  (new.id, 'staging.app.io', 'Web', 'medium', 'Ambiente de staging público'),
  (new.id, 'admin.empresa.com', 'Web', 'critical', 'Painel admin sem MFA exposto'),
  (new.id, 'cdn.empresa.com', 'CDN', 'none', 'Somente estático'),
  (new.id, 's3://empresa-backups', 'Bucket', 'critical', 'Acesso público');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();