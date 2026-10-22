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

- Pentest engines run natively inside the app via `runScan` (src/lib/scanner.functions.ts): "light" = deterministic GET-only checks (scanner.server.ts); "deep" = baseline plus a bounded AI agent (agent.server.ts) whose tools are scope-locked GET/HEAD/DNS and whose findings must cite ledger evidence — no external worker or third-party scanner, because Workers cannot host sandboxes and the product must own its engine.
- Scan execution is claimed atomically (queued → running) inside the server function so a pentest runs once.
