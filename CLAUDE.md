# Claude Code Adapter -- Unknown Instruments

@AGENTS.md

## Claude-specific
- Claude Code reads `CLAUDE.md`. Common rules live in `AGENTS.md`.
- Prioritize planning, architecture review, requirements judgment, and final validation.
- Write implementation tasks to `tasks.md` only through the coordinator role.
- Use `docs/repo-map.md` Summary first; read details only when needed.
- Auto-execute file, git, build, test, and lint operations within project boundaries.

## Shell Policy
- Primary: Bash on WSL2 for git, pnpm, node, build, test, lint.
- Secondary: PowerShell for Windows host operations only.
- Project path convention: `~/project/Unknown-Instruments`.

## Version Policy
- Keep the user's currently configured Claude Code version.
- Verify local version during Phase 0 when relevant.
