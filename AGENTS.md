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

- Game lives in src/game (client state machine in App.tsx, scoring rules in scoring.ts with tests); human scores come only from MicAnalyzer, never simulated.
- Premium character entitlements are never read from localStorage; only a verified store may grant them.
- Background music is synthesized in the browser and silenced throughout microphone measurement to avoid contaminating human scores.
- Game translations share one typed catalog and language selector; right-to-left languages set the document direction.
- Character expressions switch between original and shouting sprites through the shared Avatar, driven by the real microphone level during rounds.
