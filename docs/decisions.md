# decisions.md -- Unknown Instruments

## D001 -- Local-only application
- Decision: The app is local-only and does not need production deployment.
- Reason: The user wants personal use and GitHub development history, not public operation.
- Consequence: No auth, billing, cloud database, RLS, or production monitoring.

## D002 -- Gemini API key via `.env.local`
- Decision: Gemini API key is loaded from `.env.local` for local development.
- Reason: The user selected `.env.local` over localStorage or per-session entry.
- Consequence: `.env*` files are ignored and protected from agent reads.

## D003 -- Full implementation scope from first repository plan
- Decision: `tasks.md` covers the full product, not a reduced MVP.
- Reason: The user explicitly rejected initial-only implementation.
- Consequence: Phases remain sequential but acceptance requires all core features.

## D004 -- Decay starts OFF
- Decision: Decay is fully implemented but disabled by default.
- Reason: The user selected OFF for default Decay state.
- Consequence: UI must make Decay opt-in and dead instruments must no longer sound.

## D005 -- UI/UX reference blend
- Decision: Blend Song Maker, BeepBox, Ableton Note, and OP-1 field.
- Reason: The user prioritizes A/B/D and asks the system to choose for composition beginners.
- Allocation:
  - Song Maker: Studio grid simplicity.
  - BeepBox: lightweight browser-first song flow.
  - Ableton Note: track and effect ergonomics.
  - OP-1 field: object beauty and instrument identity.

## D006 -- Conceptual skeleton selection
### Skeleton A: Visual-first museum
- Strength: Best for product identity.
- Weakness: Risk of beautiful but silent shell.

### Skeleton B: Audio-core-first instrument system
- Strength: Validates the riskiest requirement first: sound quality and playability.
- Weakness: Visual polish arrives later.

### Skeleton C: Studio-first composition tool
- Strength: Proves final creative output early.
- Weakness: Risks generic instruments and weak core identity.

### Selected
Skeleton B, with early visual proof immediately after audio core.

## D007 -- Validation before AI integration
- Decision: Implement schema validation and deterministic fallback before Gemini calls.
- Reason: Structured outputs improve JSON shape but do not guarantee semantic sound quality.
- Consequence: Every generated field is clamped and safe before use.

## D008 -- Bash primary shell
- Decision: Use Bash on WSL2 as primary shell for this repository.
- Reason: User environment states Codex CLI and project operations default to WSL2 Bash.
- Consequence: README and commands use Bash first, with PowerShell only as secondary.
