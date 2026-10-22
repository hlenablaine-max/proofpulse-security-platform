<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Pentest engines: the "light" scanner runs in-app (src/lib/scanner.server.ts, passive GET-only, SSRF-guarded); "strix" jobs are queued in the database and executed by an external Docker worker (worker/) via /api/public/worker/* authenticated with WORKER_API_KEY — Strix needs Docker and long runtimes that Workers cannot provide.
