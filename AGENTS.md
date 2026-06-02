# Project AGENTS.md -- Unknown Instruments / pm-zero v9.5

## Language
- Completion reports, error reports, manual confirmation requests: Japanese.
- Code identifiers: English.
- When 3+ HIGH assumptions accumulate, ask immediately.

## Source of Truth
- Product intent: `docs/vision.md`
- Execution tasks: `tasks.md`
- Current state: `docs/state.md`
- Decisions: `docs/decisions.md`
- Failures: `docs/issues.md`
- Repository map: `docs/repo-map.md`
- Report: `HANDOFF-JA.md`

## Startup Read
- Read this file.
- Read `docs/state.md`.
- Read `docs/decisions.md`.
- Read `docs/repo-map.md` Summary only.

## Repository Navigation
- Use `rg` before broad manual browsing.
- Read detailed repo-map sections only when target files are unclear.
- Update `docs/repo-map.md` after structural changes.

## Task Ledger Rule
- `tasks.md` is the only execution ledger.
- Every ready task includes owner, dependencies, write scope, acceptance, verification, and evidence.
- CEO Agent updates `tasks.md` and `docs/state.md` as coordinator.

## Agent Coordination
- CEO Agent owns `tasks.md` and `docs/state.md` as coordinator.
- CEO Agent decides whether to parallelize based on Write Scope separation.
- Worker agents may edit only their assigned Write Scope.
- Parallel implementation requires disjoint Write Scopes or isolated worktrees.
- Same file means serialize. Separate scope means parallelize.
- Maximum 3 concurrent agents including CEO.

## Engineering Role
- Act as a principal-level full-stack engineer.
- Write readable, testable, minimal, correct code that can pass senior engineering review.
- Do not write placeholder code. Every committed function must work for its stated scope.

## Product Priorities
1. Sound quality.
2. Instrument appearance.
3. Text-to-sound believability.
4. Newness of experience.
5. Composition feature completeness.
6. UI polish.

## Implementation Order
- Build verifiable core first: types, validators, storage, audio boot, deterministic local instrument generation.
- Add Gemini only after schema validation and fallback paths exist.
- Build visual templates before advanced gallery and lineage polish.
- Build Workshop performance before Studio composition.
- Finish all high-risk systems before cosmetic polish.

## Thinking Protocol
- Before code changes, decompose the task into atomic subtasks.
- Challenge assumptions from first principles and prefer the simplest correct solution.
- Compare three conceptual implementation skeletons for material architecture decisions.
- Use Chain-of-Verification: draft internally, plan failure-revealing checks, verify independently, then revise using only verified facts.
- Do not output long private reasoning. Report only conclusion, evidence, and residual risk.
- Before using an external API or library function, verify the actual call shape or run a minimal test when uncertain.

## Coding Priorities
- Security
- Reliability
- Maintainability
- Testability
- Performance
- UX polish

## Commands
- install: `pnpm install`
- dev: `pnpm dev`
- lint: `pnpm lint`
- typecheck: `pnpm typecheck`
- test: `pnpm test`
- build: `pnpm build`
- verify: `pnpm verify`
- audit: `pnpm audit:project`

Use only commands that exist in this repository.

## Execution Boundaries
- Primary shell for this user: Bash on WSL2.
- Secondary shell: PowerShell on Windows host when Windows-specific operations are required.
- Runtime is local-only. No production deployment is required.
- GitHub repository: `snowtone-ai/Unknown-Instruments`.
- Do not read `.env`, `.env.local`, or any `.env.*` file unless the user explicitly requests secret inspection.
- Use `.env.example` as the template.
- API key storage uses `.env.local` for local development. Do not persist the Gemini API key in exported user data.
- Auth, billing, and production deploy are non-goals.
- All other implementation operations are AI-executed.

## Review Triggers
Use a separate review pass for:
- New external API integration.
- Audio engine architecture.
- Data import/export.
- `.env` handling.
- 300+ line diff.
- 3 consecutive failures.
- Final verification before merge to `main`.
