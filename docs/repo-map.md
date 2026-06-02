# repo-map.md -- Unknown Instruments Repository Map

## Read Policy
- Session start: read **Summary** (in Overview) only.
- Before editing: read the section for the target area when target files are unclear.
- When navigation is unclear: read Entry Points and Core Architecture.
- After structural changes: update only the affected section.

---

## 1. Overview

### Summary
- App type: Local-only Vite + React + TypeScript browser music app.
- Runtime: Chrome browser, Web Audio API through Tone.js.
- Package manager: pnpm.
- Primary source: `src/`. Tests: `tests/`. Docs: `docs/`.
- Product intent: `docs/vision.md`. Tasks: `tasks.md`. State: `docs/state.md`.
- Verification: `pnpm verify`. Secrets: `.env.local` — never read or commit.

### Description
Unknown Instruments is a local-only "sound artifact lab." Users type a text prompt describing a sound image; the app calls the Gemini API (with a deterministic local fallback) to generate a fictional instrument spec, renders it as an SVG visual, and plays it via Tone.js. Instruments accumulate decay over play-count, eventually becoming "ruins." Instruments can spawn children or crossbreeds. A multi-track Studio sequencer composes songs from saved instruments and can export WAV. All data persists in the browser via localStorage/IndexedDB.

---

## 2. Entry Points

| File | Symbol | Role |
|---|---|---|
| `src/main.tsx` | — | React DOM mount. Top of the tree. |
| `src/App.tsx:17` | `App()` | Shell: audio unlock gate, page routing, `AppStoreProvider` wrapper. |
| `src/engine/AudioEngine.ts:5` | `AudioEngine` | Tone.js audio session lifecycle. `start()` must be called after user gesture. |
| `src/ai/GeminiClient.ts:6` | `generateInstrument()` | Primary Gemini REST call (3-retry). Returns validated `Instrument`. |
| `src/ai/fallbackGenerator.ts:4` | `generateFallbackInstrument()` | Deterministic local fallback when Gemini is unavailable. |
| `scripts/verify.mjs:3` | `commands` | `pnpm verify` — sequential: lint → typecheck → test → build. |

---

## 3. Core Architecture

| Directory | Responsibility | Key relationships |
|---|---|---|
| `src/ai/` | Gemini prompt, API client, JSON validation, fallback/crossbreed/reverse generators | → `src/types/` for schema; → `src/engine/` output used by WorkshopPage |
| `src/engine/` | Tone.js audio engine, synth factory, effects, Sequencer, WavExport | `AudioEngine` wraps Tone.js; `SynthFactory` dispatches on `synth.type` |
| `src/visual/` | SVG `InstrumentRenderer` + 6 parametric templates | → `src/types/` `VisualParams`; template selected by `visual.template` string |
| `src/ui/pages/` | GalleryPage, WorkshopPage, StudioPage, SettingsPage | All consume `useAppStore()`; Workshop owns instrument generation |
| `src/ui/gallery/` | InstrumentTile, RuinsView, LineageTree | Displayed inside GalleryPage |
| `src/ui/common/` | Navigation | 4-tab nav rendered by `App` |
| `src/stores/` | `AppStoreProvider`, `useAppStore`, store model helpers | Persists via `HybridStorageAdapter`; holds instruments, songs, settings |
| `src/data/` | `HybridStorageAdapter`, `IndexedDbStorageAdapter`, exportImport | Routes to IndexedDB for payloads ≥ threshold; smaller payloads use localStorage |
| `src/types/` | All domain TypeScript interfaces | `Instrument` is the central contract; must stay in sync with validator |
| `src/utils/` | decay math, MIDI conversion, scales, ID generation | Stateless pure functions; keep deterministic |
| `scripts/` | verify, audit helpers | `verify.mjs` is the single quality gate |

---

## 4. Important Symbols

| Symbol | Location | Why it matters |
|---|---|---|
| `Instrument` | `src/types/index.ts:105` | Central domain object. Every subsystem reads or writes it. |
| `SynthParams`, `FilterParams`, `EffectParams`, `VisualParams` | `src/types/index.ts:21–57` | Sub-schemas of `Instrument`; constrained to Tone.js-valid values by validator. |
| `LineageInfo` | `src/types/index.ts:87` | Tracks parent, generation, children, crossbreed parents. |
| `AudioEngine` | `src/engine/AudioEngine.ts:5` | Wraps one Tone.js synth chain. `loadInstrument` → `trigger` → `dispose`. |
| `createSynth()` | `src/engine/SynthFactory.ts:42` | Dispatches `fm/am/mono/pluck/metal` → correct `Tone.PolySynth` subclass. |
| `createFilter()` | `src/engine/SynthFactory.ts:77` | `Tone.Filter` factory. |
| `Sequencer` | `src/engine/Sequencer.ts:6` | Multi-track playback; spawns one `AudioEngine` per track, schedules notes with `setTimeout`. |
| `exportSongWav()` | `src/engine/WavExport.ts:12` | Offline Tone.js render → `AudioBuffer` → WAV `Blob`. |
| `generateInstrument()` | `src/ai/GeminiClient.ts:6` | Gemini REST, model `gemini-2.5-flash`, structured JSON output, 3-retry. |
| `buildInstrumentPrompt()` | `src/ai/prompts.ts:1` | Japanese-language prompt with hard constraints on synth types, visual templates, interaction types. |
| `validateAndClampInstrument()` | `src/ai/validator.ts:45` | Converts raw Gemini JSON to safe `Instrument`; defaults every field; clamps numerics. |
| `generateFallbackInstrument()` | `src/ai/fallbackGenerator.ts:4` | Deterministic local generation; used when Gemini fails. |
| `generateLocalCrossbreed()` | `src/ai/crossbreedGenerator.ts:4` | Produces a child instrument from two parents. |
| `createSuccessionText()` | `src/ai/reverseGenerator.ts:3` | Generates a text description from an existing instrument (lineage succession). |
| `AppStoreProvider` | `src/stores/appStore.tsx:5` | Global React Context provider; owns instruments, songs, settings state + persistence effects. |
| `useAppStore` | `src/stores/appStoreHooks.ts:4` | Store hook separated from the provider for React Fast Refresh compatibility. |
| `defaultSettings` / `createEmptySong()` | `src/stores/appStoreModel.ts:9/16` | Shared settings defaults and song factory used by Studio and tests. |
| `HybridStorageAdapter` | `src/data/storage.ts:27` | Auto-routes to IndexedDB for large payloads; falls back to localStorage. |
| `InstrumentRenderer` | `src/visual/InstrumentRenderer.tsx:18` | SVG renderer; applies `DecayOverlay` based on `calculateDecayFactor`. |
| `renderTemplate()` | `src/visual/InstrumentRenderer.tsx:36` | Switch on `visual.template` → one of 6 SVG template components. |
| `calculateDecayFactor()` | `src/utils/decay.ts:1` | Quadratic `p²` decay; `p = playCount / lifespan`. Returns 0–1. |

---

## 5. Data / Control Flow

### Instrument Generation
```
WorkshopPage.handleGenerate(text)
  → generateInstrument(text, apiKey)          [src/ai/GeminiClient.ts]
      → buildInstrumentPrompt(text)           [src/ai/prompts.ts]
      → Gemini REST API (3 retries)
      → validateAndClampInstrument(rawJson)   [src/ai/validator.ts]
      → Instrument
  [on error] → generateFallbackInstrument(text) [src/ai/fallbackGenerator.ts]
  → saveInstrument(instrument)                [appStore]
      → HybridStorageAdapter.save()           [src/data/storage.ts]
```

### Instrument Playback (Workshop)
```
WorkshopPage.play(note)
  → AudioEngine.loadInstrument(instrument)
      → createSynth(synth)                    [src/engine/SynthFactory.ts]
      → createFilter(filter)
      → createEffect[] → synth.chain(filter, effects, Tone.getDestination())
  → AudioEngine.trigger(note, duration, velocity)
      → synth.triggerAttackRelease(...)
```

### Studio Sequencer Playback
```
StudioPage → Sequencer.play(song, instruments)
  → per track: new AudioEngine().loadInstrument(instrument)
  → per note: window.setTimeout(() => engine.trigger(...), delay)
StudioPage.downloadWav → exportSongWav(song, instruments)
  → Tone.Offline(render) → audioBufferToWav → Blob download
```

### Gallery Render Path
```
GalleryPage
  → InstrumentTile → InstrumentRenderer → renderTemplate(visual)
                                        → {Stringed|Wind|Percussion|Organic|Spiral|Crystalline}Template
                   → DecayOverlay(calculateDecayFactor(playCount, lifespan))
  → RuinsView (dead instruments)
  → LineageTree (all instruments, lineage links)
```

### Persistence
```
AppStoreProvider (React effect on state change)
  → HybridStorageAdapter.save(key, data)
      [large] → IndexedDbStorageAdapter.save()  [src/data/indexedDbStorage.ts]
      [small] → localStorage.setItem(key, JSON)
AppStoreProvider (boot hydration)
  → HybridStorageAdapter.load() × 3 (instruments, songs, settings)
```

---

## 6. Tests

| File | Coverage area |
|---|---|
| `tests/clamp.test.ts` | Numeric clamping utilities |
| `tests/decayEngine.test.ts` | `calculateDecayFactor` math |
| `tests/exportImport.test.ts` | JSON backup/restore round-trip |
| `tests/midi.test.ts` | MIDI ↔ note name conversion (`midiToNoteName`) |
| `tests/songDecay.test.ts` | Song-level decay logic |
| `tests/timeSensitivity.test.ts` | Time-dependent decay (simulated or real — uncertain) |
| `tests/validator.test.ts` | `validateAndClampInstrument` edge cases (**critical**: guards AI output) |
| `tests/wavExport.test.ts` | WAV export pipeline |

Run: `pnpm test`  
Full gate: `pnpm verify` (lint → typecheck → test → build)

---

## 7. Config / Build / Tooling

| File | Purpose |
|---|---|
| `vite.config.*` | Vite build config (React plugin, env vars) |
| `tsconfig.json` | TypeScript config |
| `package.json` | Scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `verify`, `audit:project` |
| `pnpm-lock.yaml` | Lockfile — do not hand-edit |
| `eslint.config.*` | ESLint flat config |
| `scripts/verify.mjs` | Sequential quality gate: lint → typecheck → test → build |
| `.env.local` | `VITE_GEMINI_API_KEY`, `VITE_GEMINI_MODEL` (default: `gemini-2.5-flash`) |
| `.env.example` | Template — use this, not `.env.local`, as reference |

Key runtime deps: `tone` (audio), `react` + `react-dom`, `vite`, `vitest`.

---

## 8. Agent Navigation Rules

### Read first for common tasks
| Task | Read first |
|---|---|
| Add / change synth behavior | `src/types/index.ts`, `src/engine/SynthFactory.ts` |
| Add visual template | `src/types/index.ts` (`VisualParams`), `src/visual/InstrumentRenderer.tsx` |
| Change AI generation | `src/ai/GeminiClient.ts`, `src/ai/prompts.ts`, `src/ai/validator.ts` |
| Change storage | `src/data/storage.ts`, `src/data/indexedDbStorage.ts` |
| Add page / route | `src/App.tsx`, `src/ui/pages/` |
| Change decay logic | `src/utils/decay.ts`, `tests/decayEngine.test.ts` |
| Change lineage/crossbreed | `src/ai/crossbreedGenerator.ts`, `src/ai/reverseGenerator.ts`, `src/types/index.ts` (`LineageInfo`) |

### Avoid unless directly relevant
- `node_modules/`, `dist/`, `coverage/`, `*.tsbuildinfo`
- `.env`, `.env.*` files (never read API keys)
- `pnpm-lock.yaml`

### CodeGraph-first workflow
1. Call `codegraph_context "task description"` — covers most questions in one shot.
2. For a call chain: `codegraph_trace From → To`.
3. For a specific symbol body: `codegraph_node SymbolName`.
4. Fall back to `Read` only when CodeGraph output is insufficient.

---

## 9. Open Questions

- `src/ai/reverseGenerator.ts` (`createSuccessionText`): exact role in the generation/lineage flow not fully traced — likely generates a text prompt from an existing instrument for succession children.
- `tests/timeSensitivity.test.ts`: unclear whether it uses simulated time (`vi.useFakeTimers`) or real elapsed time.
- `scripts/` contents beyond `verify.mjs`: `audit:project` target not inspected.
- Visual template `DecayOverlay` and `TextureFilters` implementations: referenced but not explored in detail.
