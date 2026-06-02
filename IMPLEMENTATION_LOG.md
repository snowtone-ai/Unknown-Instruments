# IMPLEMENTATION_LOG.md

## Repository State
- App: Vite + React 18 + TypeScript.
- Package manager: pnpm.
- Current implementation: functional local-only browser app with Gallery, Workshop, Studio, Settings, Gemini generation, local fallback, Tone.js playback, SVG rendering, persistence, import/export, Decay, snapshots, lineage, crossbreeding, sequencer, and WAV export.
- Design source: `docs/reference/unknown_instruments_design.md` (`Unknown Instruments 設計書 v1.1`).
- Git status: unavailable in this directory (`fatal: not a git repository`).

## Milestones
- C0 audit/log: complete.
- C1 app foundation: complete.
- C2 validation/storage/settings: complete.
- C3 Gemini integration: complete for browser use with settings key or `VITE_GEMINI_API_KEY`.
- C4 audio engine: complete for Tone.js synth/effects/playback lifecycle.
- C5 visual engine: complete with six SVG templates and Decay overlay.
- C6-C9 Workshop/Gallery/Studio/Decay: complete for main flows.
- C10 final hardening: complete for build/test/verify and browser smoke.
- C11 AI-executable cleanup: complete. Fast Refresh warnings were removed by splitting store helpers/hooks and SVG texture helpers out of component files.

## Validation Commands
- `rtk pnpm typecheck`
- `rtk pnpm lint`
- `rtk pnpm test`
- `rtk pnpm build`
- `rtk pnpm verify`

## Open Risks
- Live Gemini call was exercised through the browser using the configured environment, but API key contents were not read.
- Browser audio startup overlay was verified; actual speaker output quality still depends on the user's device and browser audio policy.
- Web MIDI requires a real MIDI device and browser permission; unit-level mapping exists, device smoke remains external.
- Human review remains external.

## Final Validation
- `rtk pnpm install`: passed.
- `rtk pnpm test`: passed, 8 files / 13 tests.
- `rtk pnpm build`: passed.
- `rtk pnpm verify`: passed (`lint`, `typecheck`, `test`, `build`, `audit:project`).
- Browser smoke at `http://127.0.0.1:5173`: Start Audio overlay, Gallery, Workshop Gemini generation + SVG display, Settings key source/data display, Studio song creation and grid note toggle verified.
- 2026-06-02 follow-up `rtk pnpm verify`: passed with zero ESLint warnings; 8 test files / 13 tests passed.
- 2026-06-02 follow-up browser smoke at `http://127.0.0.1:5173`: app rendered after reload, Start Audio overlay visible, Gallery/Workshop/Studio/Settings tab navigation verified.
