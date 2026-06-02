/goal Implement the full Unknown Instruments product in this repository, exactly according to the product design document, without stopping until the app builds, tests pass, and the main user flows work end-to-end.

# Primary source of truth

Read the product design document first and treat it as the authoritative specification:

- `unknown_instruments_design_v1.1_minimal.md`
- If that file is not present, search the repository for a Markdown design document whose title is `Unknown Instruments 設計書` and use the newest version.
- Do not replace, summarize away, or reinterpret the design. Implement the product described there.

The product is a fully client-side browser app named **Unknown Instruments**. Users type an image of a sound, the app generates a fictional instrument via Gemini API, renders a parametric SVG instrument, lets the user play it with Tone.js, lets the user compose with generated instruments, and persists all data locally.

# Non-negotiable implementation scope

Implement the complete product, not a placeholder demo.

Required product areas:

1. React 18 + TypeScript + Vite app structure.
2. Tone.js audio engine with SynthFactory, effects chain, AudioContext startup handling, sequencer, and WAV export.
3. Gemini API integration using `gemini-2.5-flash` and structured JSON output.
4. AI output validation, schema checking, numeric clamping, parse recovery, and safe fallbacks.
5. Local persistence with localStorage and IndexedDB fallback.
6. Full data models from the design document.
7. Gallery, Workshop, Studio, and Settings screens.
8. Instrument generation, regeneration, playback, parameter adjustment, snapshot save/restore, lineage, generation succession, and crossbreeding.
9. All five interaction UIs: `keys`, `slide`, `tap`, `drag`, `bow`.
10. All six SVG visual templates as real parametric React components: `stringed`, `wind`, `percussion`, `crystalline`, `organic`, `spiral`.
11. Decay system for audio parameters and visual overlays.
12. Time sensitivity toggle and behavior.
13. Grid sequencer with tracks, scale selection, tempo, loop, mute/solo, and export.
14. Import/export of collection data.
15. Settings page for Gemini API key, Decay, time sensitivity, default scale, language, and data management.

Do not implement Claude Artifact mode. Do not depend on a backend server. Do not require GPU. Do not introduce paid services other than the user-provided Gemini API key path.

# Required technology decisions

Use the repository's existing package manager and conventions if present. If this is an empty or minimal repository, initialize with:

- React 18
- TypeScript
- Vite
- Tone.js
- A small state solution: React Context or Zustand, whichever keeps the implementation simpler and more maintainable
- Vitest + Testing Library for unit/component tests
- Playwright only if it is practical for smoke/E2E validation

Do not add unnecessary production dependencies. Before adding a dependency, prefer browser APIs or small local utilities. If a dependency is added, document why it is necessary.

# Google engineering-practices rules to obey

Code must be written as if it will go through review under Google Engineering Practices.

Apply these rules strictly:

1. Preserve and improve code health with every change.
   - Do not accept shortcuts that make the codebase harder to maintain.
   - Do not add complexity unless it directly serves a current requirement.

2. Work in small, self-contained internal checkpoints.
   - Even though this is one `/goal`, split the implementation into reviewable milestones.
   - Each milestone must leave the repository buildable or clearly document the temporary state.
   - Avoid giant unrelated changes in one step.

3. Keep the design simple.
   - Prefer clear, boring, testable code over clever abstractions.
   - Do not build speculative framework layers for future features not required by the design.
   - Avoid over-generalization.

4. Make functionality good for users.
   - All visible UI must be usable, responsive, and sensible.
   - Handle loading, error, empty, and invalid-state cases.
   - Never expose raw stack traces or confusing API errors to users.

5. Test the important behavior.
   - Add tests for validators, parameter clamping, decay calculations, scale utilities, storage adapters, and AI response parsing.
   - Add component tests for critical UI state where practical.
   - Add at least one smoke test or documented manual validation flow for the main app.

6. Use clear names.
   - Names must reveal intent.
   - Avoid vague names such as `data`, `stuff`, `thing`, `handleIt`, or `process` when a precise name is possible.

7. Write useful comments only.
   - Comments should explain why something exists, not restate what the code already says.
   - Document non-obvious browser audio constraints, Gemini output recovery, and storage fallback decisions.

8. Keep files cohesive.
   - Do not create huge components that mix UI, storage, AI calls, audio synthesis, and validation.
   - Keep modules aligned with the architecture in the design document.

9. Use technical facts over preference.
   - Follow existing repository style if present.
   - If no style exists, add Prettier/ESLint defaults that are standard for React + TypeScript and keep them consistent.

10. Review your own work before continuing.
    - After each checkpoint, inspect the changed files, run available checks, fix obvious issues, and only then proceed.

# Implementation order

Follow this order unless the existing repository structure requires a small adjustment.

## Checkpoint 0: Repository audit and plan

- Inspect the repository structure.
- Identify package manager, existing scripts, lint/test/build setup, and app entry points.
- Read the full design document.
- Create or update `IMPLEMENTATION_LOG.md` with:
  - current repository state
  - implementation milestones
  - validation commands
  - open risks

If `AGENTS.md` does not exist, create a concise repository-level `AGENTS.md` containing setup commands, validation commands, coding style, and the Google engineering-practices expectations above.

## Checkpoint 1: App foundation

- Set up React + TypeScript + Vite if not already present.
- Create the module structure described in the design document.
- Add central TypeScript domain models.
- Add navigation and four top-level pages: Gallery, Workshop, Studio, Settings.
- Add global app state/store.
- Add basic styling that is usable and responsive.

Validation:

- install dependencies
- run typecheck
- run lint if configured
- run tests if configured
- run build

## Checkpoint 2: Validation, storage, and settings

Implement:

- schema validator and numeric clamping
- localStorage adapter
- IndexedDB fallback for larger collections
- settings store
- Gemini API key storage in local settings
- export/import JSON excluding API key
- storage usage display

Security requirements:

- Never commit or hardcode an API key.
- Never log full API keys.
- Mask API keys in UI by default.

Tests:

- validator tests
- clamp tests
- storage adapter tests where practical
- export/import tests

## Checkpoint 3: Gemini AI integration

Implement:

- `GeminiClient.ts`
- prompt templates for instrument generation, reverse generation, and crossbreeding
- structured JSON generation using Gemini 2.5 Flash
- retry/recovery for malformed responses
- user-facing error messages for missing key, quota/rate limit, network failure, invalid JSON, and safety refusal

Output must map into the design document's `Instrument` model.

Tests:

- parse valid Gemini response
- reject invalid response safely
- clamp out-of-range response values
- preserve fallback defaults

## Checkpoint 4: Audio engine

Implement:

- AudioContext/Tone startup overlay
- SynthFactory for `fm`, `am`, `mono`, `pluck`, `metal`
- PluckSynth voice pool
- effect chain: reverb, distortion, delay, chorus, tremolo, autofilter
- filter chain
- instrument switching and dispose lifecycle
- playback API accepting MIDI note events
- safe volume defaults to avoid clipping

Tests:

- pure parameter mapping tests where possible
- no browser-only APIs in unit tests unless mocked

Manual validation:

- create or load a sample instrument
- click/touch playback works after user gesture
- switching instruments disposes previous nodes

## Checkpoint 5: SVG visual engine

Implement all six templates as real parametric SVG React components:

- `StringedTemplate.tsx`
- `WindTemplate.tsx`
- `PercussionTemplate.tsx`
- `CrystallineTemplate.tsx`
- `OrganicTemplate.tsx`
- `SpiralTemplate.tsx`

Requirements:

- Use `VisualParams` exactly.
- Respect `primaryColor`, `accentColor`, `texture`, `complexity`, and `elementCount`.
- Implement SVG filters for rough, metallic, organic, and crystalline textures.
- Implement `DecayOverlay.tsx` with visual changes by decay progress and `decayCharacter`.
- Do not replace the templates with generic placeholders.

Validation:

- render all six templates in a local gallery/dev route or story-like section
- confirm no SVG runtime errors

## Checkpoint 6: Workshop

Implement:

- text input for sound image
- generate button
- instrument card
- large SVG display
- generated name, etymology, description, materials, shape, playing method
- lifespan indicator
- all five play UIs
- fallback keyboard UI
- preview button
- regenerate
- parameter adjustment panel
- snapshot save/restore
- generation succession
- crossbreeding flow

Requirements:

- Decay applies to Workshop playback only when enabled.
- Studio playback must not consume instrument lifespan.
- Dead instruments become ruins and cannot be played normally.

Validation:

- generate an instrument using Gemini key
- play it
- save snapshot
- regenerate
- create child instrument
- crossbreed two instruments

## Checkpoint 7: Gallery

Implement:

- living instruments section
- ruins section
- instrument tiles with SVG thumbnail, name, lifespan bar, generation
- open instrument in Workshop
- lineage tree view
- ruins view
- empty state with clear call to create first instrument

Validation:

- generated instruments appear
- dead instruments move to ruins
- lineage links render correctly

## Checkpoint 8: Studio sequencer

Implement:

- song model and song store
- grid sequencer
- scale selector
- tempo control
- bar count
- time signature handling
- track panel
- track instrument assignment
- mute/solo/volume
- play/stop/loop
- Tone.Transport scheduling
- WAV export using offline rendering
- song decay mode if described in the design document

Tests:

- scale utility tests
- beat/grid conversion tests
- song duration tests

Validation:

- create a song
- assign at least two instruments
- add notes
- play loop
- export WAV

## Checkpoint 9: Decay, time sensitivity, and advanced behavior

Implement:

- decay factor calculation
- seeded decay variation
- decay vector application
- audio parameter mutation
- visual decay overlay
- death/ruin transition
- time sensitivity toggle and time-based parameter changes
- snapshot behavior independent from decay
- Studio decay isolation

Tests:

- decay curve tests
- seeded deterministic behavior tests
- clamp after decay tests
- time sensitivity branch tests with mocked time

## Checkpoint 10: Final hardening

- Remove placeholder content that should not ship.
- Make all errors user-friendly.
- Ensure responsive layout works on desktop and reasonable mobile widths.
- Ensure keyboard/mouse/touch interactions are usable.
- Ensure all exported JSON can be imported back.
- Ensure no API key is included in exports.
- Ensure no console spam remains.
- Ensure all objects are disposed correctly where applicable.
- Ensure README includes setup, scripts, API key instructions, and known browser audio limitations.

Final validation commands must include, if available:

- dependency install check
- `typecheck`
- `lint`
- `test`
- `build`
- app launch smoke test

# Stop condition

Do not stop until all of the following are true:

1. The app implements every required product area from the design document.
2. All six SVG templates are implemented as distinct parametric components.
3. Gemini-based instrument generation works behind a user-provided API key.
4. Audio playback works after a user gesture.
5. Gallery, Workshop, Studio, and Settings are all functional.
6. Local persistence works.
7. Import/export works.
8. Decay and snapshots work.
9. The sequencer can create, play, loop, and export a song.
10. Typecheck, lint, tests, and build pass, or any unavailable command is explicitly justified in `IMPLEMENTATION_LOG.md`.
11. `IMPLEMENTATION_LOG.md` contains a final summary of completed work, validation results, and any remaining known limitations.

# When blocked

Do not ask the user to make routine implementation decisions. Use the design document and choose the simplest maintainable option.

Pause only if:

- the design document is missing and cannot be found anywhere in the repository,
- dependency installation is impossible due to environment/network failure,
- required secrets are needed for live API validation,
- or a repository-specific constraint makes the requested architecture impossible.

When blocked, write the exact blocker, the command/output that proves it, and the smallest user action needed to unblock.

# Final response expected from Codex

When finished, report:

- completed milestones
- key files changed
- validation commands run and results
- any features that were validated manually
- any known limitations
- whether the repository is ready for human review
