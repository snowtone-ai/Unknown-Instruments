# tasks.md -- Unknown Instruments pm-zero v9.5 Execution Ledger

## Goal Binding
- Active goal: Complete local-only Unknown Instruments implementation.
- Planning owner: Claude Code / CEO Agent
- Implementation owner: Codex CLI by default
- Review owner: Claude Code for critical review; Codex fallback if unavailable

## Status Vocabulary
- proposed: idea exists, not ready
- ready: owner, dependencies, write scope, acceptance, verification, and expected evidence are clear
- doing: one owner is actively working
- blocked: needs decision, dependency, credential, environment, or human action
- review: implementation complete, review pending
- done: accepted by reviewer
- verified: evidence recorded

## Implementation Principle
- This is a complete implementation plan, not an MVP-only plan.
- Execute in professional full-stack order: foundation → domain safety → storage → audio → AI → visual → Workshop → Play UIs → Decay/lineage → Studio → export/data management → UX → verification.
- Same file means serialize. Disjoint write scope means parallelize only if useful.

## Tasks

| ID | Status | Owner | Depends On | Write Scope | Acceptance | Verification | Evidence |
|---|---|---|---|---|---|---|---|
| **P0** | **ready** | CEO Agent | varies | phase marker | **Repository and pm-zero foundation** | see tasks below | pending |
| T001 | ready | CEO Agent | none | AGENTS.md, CLAUDE.md, docs/**, scripts/** | Repository memory files match pm-zero v9.5 and project decisions | pnpm audit:project | pending |
| T002 | ready | Codex | T001 | package.json, tsconfig*.json, vite.config.ts, eslint.config.js | Vite React TypeScript scripts are present and installable | pnpm install && pnpm typecheck | pending |
| T003 | ready | Codex | T002 | .gitignore, .env.example, README.md | Local setup path and GitHub push path are documented without secrets | git diff --check | pending |
| T004 | ready | Codex | T002 | src/main.tsx, src/App.tsx, src/styles.css | App shell renders Gallery/Workshop/Studio/Settings navigation | pnpm build | pending |
| **P1** | **ready** | CEO Agent | varies | phase marker | **Domain model and validation** | see tasks below | pending |
| T005 | ready | Codex | T004 | src/types/index.ts | All confirmed domain interfaces are represented | pnpm typecheck | pending |
| T006 | ready | Codex | T005 | src/utils/clamp.ts, src/utils/id.ts | Shared clamp and id helpers are deterministic and tested | pnpm test clamp id | pending |
| T007 | ready | Codex | T005 | src/utils/midi.ts, src/utils/scales.ts | MIDI/frequency conversion and scale note generation match expected ranges | pnpm test midi scales | pending |
| T008 | ready | Codex | T005 | src/ai/validator.ts, tests/validator.test.ts | Raw AI JSON is converted to safe clamped Instrument fields | pnpm test validator | pending |
| T009 | ready | Codex | T008 | src/ai/validator.ts | Invalid synth/effect/visual/interaction values fall back safely | pnpm test validator | pending |
| T010 | ready | Codex | T008 | src/ai/schema.ts | Structured output schema mirrors validator-supported fields | pnpm typecheck && pnpm test validator | pending |
| **P2** | **ready** | CEO Agent | varies | phase marker | **Storage and local data ownership** | see tasks below | pending |
| T011 | ready | Codex | T005 | src/data/storage.ts | StorageAdapter saves, loads, deletes, and lists namespaced keys | pnpm test storage | pending |
| T012 | ready | Codex | T011 | src/data/storage.ts | localStorage is used under small-size threshold | pnpm test storage | pending |
| T013 | ready | Codex | T011 | src/data/indexedDbStorage.ts | IndexedDB adapter stores larger collections | pnpm test storage | pending |
| T014 | ready | Codex | T011,T013 | src/data/storage.ts | Automatic storage selection preserves existing records | pnpm test storage | pending |
| T015 | ready | Codex | T011 | src/data/exportImport.ts | Collection export excludes API keys | pnpm test exportImport | pending |
| T016 | ready | Codex | T015 | src/data/exportImport.ts | Collection import validates and merges by id | pnpm test exportImport | pending |
| T017 | ready | Codex | T011 | src/data/reset.ts | Delete-all clears instruments, songs, settings except env file | pnpm test storage | pending |
| **P3** | **ready** | CEO Agent | varies | phase marker | **Audio engine** | see tasks below | pending |
| T018 | ready | Codex | T005 | src/engine/AudioEngine.ts | Tap-to-start initializes Tone context once | pnpm typecheck && browser smoke | pending |
| T019 | ready | Codex | T018 | src/engine/SynthFactory.ts | fm creates playable PolySynth(FMSynth) | pnpm test synthFactory && browser smoke | pending |
| T020 | ready | Codex | T019 | src/engine/SynthFactory.ts | am creates playable PolySynth(AMSynth) | pnpm test synthFactory | pending |
| T021 | ready | Codex | T019 | src/engine/SynthFactory.ts | mono creates playable PolySynth(MonoSynth) | pnpm test synthFactory | pending |
| T022 | ready | Codex | T019 | src/engine/SynthFactory.ts | pluck uses a voice pool and round-robin triggering | pnpm test synthFactory | pending |
| T023 | ready | Codex | T019 | src/engine/SynthFactory.ts | metal creates playable PolySynth(MetalSynth) | pnpm test synthFactory | pending |
| T024 | ready | Codex | T019 | src/engine/EffectChain.ts | All effect types connect in serial after filter | pnpm test effectChain | pending |
| T025 | ready | Codex | T024 | src/engine/AudioEngine.ts | Instrument switching disposes old synth/effect graph | pnpm test audioEngine && browser memory smoke | pending |
| T026 | ready | Codex | T025 | src/engine/AudioEngine.ts | Dead instruments never trigger sound | pnpm test audioEngine | pending |
| T027 | ready | Codex | T025 | src/engine/TimeSensitivity.ts | Time sensitivity modifies params only when enabled | pnpm test timeSensitivity | pending |
| **P4** | **ready** | CEO Agent | varies | phase marker | **AI integration** | see tasks below | pending |
| T028 | ready | Codex | T010 | src/ai/prompts.ts | Generation prompt returns only schema-shaped JSON instructions | pnpm test prompts | pending |
| T029 | ready | Codex | T028 | src/ai/GeminiClient.ts | Gemini call reads VITE_GEMINI_API_KEY without printing it | pnpm test geminiClient | pending |
| T030 | ready | Codex | T029 | src/ai/GeminiClient.ts | Automatic retry handles transient 429/5xx failures | pnpm test geminiClient | pending |
| T031 | ready | Codex | T030 | src/ai/GeminiClient.ts, src/ai/validator.ts | AI response is parsed, cleaned, validated, and clamped | pnpm test ai | pending |
| T032 | ready | Codex | T031 | src/ai/fallbackGenerator.ts | Local fallback generates a safe instrument when API fails finally | pnpm test fallbackGenerator | pending |
| T033 | ready | Codex | T031 | src/ai/reverseGenerator.ts | Reverse generation creates 20-40 Japanese characters for lineage | pnpm test reverseGenerator | pending |
| T034 | ready | Codex | T031 | src/ai/crossbreedGenerator.ts | Crossbreed prompt and local merge path produce child instrument | pnpm test crossbreedGenerator | pending |
| **P5** | **ready** | CEO Agent | varies | phase marker | **Visual instrument engine** | see tasks below | pending |
| T035 | ready | Codex | T005 | src/visual/InstrumentRenderer.tsx | Renderer selects template from VisualParams | pnpm typecheck && pnpm build | pending |
| T036 | ready | Codex | T035 | src/visual/templates/StringedTemplate.tsx | Stringed template renders body, strings, pegs, texture | pnpm build && visual smoke | pending |
| T037 | ready | Codex | T035 | src/visual/templates/WindTemplate.tsx | Wind template renders tubes, bell, holes/keys | pnpm build && visual smoke | pending |
| T038 | ready | Codex | T035 | src/visual/templates/PercussionTemplate.tsx | Percussion template renders membranes/plates and stand | pnpm build && visual smoke | pending |
| T039 | ready | Codex | T035 | src/visual/templates/CrystallineTemplate.tsx | Crystalline template renders distinct crystal clusters | pnpm build && visual smoke | pending |
| T040 | ready | Codex | T035 | src/visual/templates/OrganicTemplate.tsx | Organic template renders organism-like curved body | pnpm build && visual smoke | pending |
| T041 | ready | Codex | T035 | src/visual/templates/SpiralTemplate.tsx | Spiral template renders coils and resonant structure | pnpm build && visual smoke | pending |
| T042 | ready | Codex | T036,T037,T038,T039,T040,T041 | src/visual/textureFilters.tsx | All texture modes map to safe SVG filters | pnpm build | pending |
| T043 | ready | Codex | T042 | src/visual/DecayOverlay.tsx | Decay overlay supports oxidation, erosion, crystallization, withering, dissolution | pnpm build && visual smoke | pending |
| **P6** | **ready** | CEO Agent | varies | phase marker | **Global state and settings** | see tasks below | pending |
| T044 | ready | Codex | T011 | src/stores/settingsStore.ts | Settings load/save default scale, language, Decay OFF, time sensitivity | pnpm test settingsStore | pending |
| T045 | ready | Codex | T011 | src/stores/instrumentStore.ts | Instrument collection CRUD works with storage adapter | pnpm test instrumentStore | pending |
| T046 | ready | Codex | T011 | src/stores/songStore.ts | Song CRUD works with storage adapter | pnpm test songStore | pending |
| T047 | ready | Codex | T045,T046 | src/stores/selectors.ts | Derived counts and storage usage display accurately | pnpm test stores | pending |
| **P7** | **ready** | CEO Agent | varies | phase marker | **Gallery** | see tasks below | pending |
| T048 | ready | Codex | T045,T035 | src/ui/pages/GalleryPage.tsx | Gallery lists living instruments and ruins separately | pnpm build && browser smoke | pending |
| T049 | ready | Codex | T048 | src/ui/gallery/InstrumentTile.tsx | Tile shows SVG thumbnail, name, lifespan, generation | pnpm build | pending |
| T050 | ready | Codex | T048 | src/ui/gallery/RuinsView.tsx | Ruins render dead instruments in grayscale broken state | pnpm build && browser smoke | pending |
| T051 | ready | Codex | T045 | src/ui/gallery/LineageTree.tsx | Lineage tree renders parent-child and crossbreed joins | pnpm build && browser smoke | pending |
| **P8** | **ready** | CEO Agent | varies | phase marker | **Workshop generation and instrument detail** | see tasks below | pending |
| T052 | ready | Codex | T031,T045,T035 | src/ui/pages/WorkshopPage.tsx | Workshop can generate, display, save, and regenerate instruments | pnpm build && browser smoke | pending |
| T053 | ready | Codex | T052 | src/ui/workshop/TextInput.tsx | Text input validates empty/long entries and shows generation status | pnpm build | pending |
| T054 | ready | Codex | T052 | src/ui/workshop/InstrumentCard.tsx | Instrument detail shows name, etymology, description, materials, shape, method | pnpm build | pending |
| T055 | ready | Codex | T052,T025 | src/ui/workshop/PreviewControls.tsx | Preview plays safe sample without applying Decay | pnpm build && browser audio smoke | pending |
| T056 | ready | Codex | T052 | src/ui/workshop/ParameterPanel.tsx | Manual synth/filter/effects adjustment rebuilds synth safely | pnpm build && browser audio smoke | pending |
| T057 | ready | Codex | T052 | src/ui/workshop/SnapshotPanel.tsx | Snapshots save, label, list, and restore frozen params | pnpm test snapshots && pnpm build | pending |
| **P9** | **ready** | CEO Agent | varies | phase marker | **Play UIs and MIDI** | see tasks below | pending |
| T058 | ready | Codex | T025,T052 | src/ui/workshop/PlayUI.tsx | PlayUI routes by interaction.type with keyboard fallback | pnpm build && browser smoke | pending |
| T059 | ready | Codex | T058 | src/ui/workshop/KeysUI.tsx | Keys UI supports mouse/touch and QWERTY mapping | pnpm build && browser audio smoke | pending |
| T060 | ready | Codex | T058 | src/ui/workshop/SlideUI.tsx | Slide UI maps X to pitch and drag speed to velocity | pnpm build && browser audio smoke | pending |
| T061 | ready | Codex | T058 | src/ui/workshop/TapUI.tsx | Tap UI maps pads to notes and velocity | pnpm build && browser audio smoke | pending |
| T062 | ready | Codex | T058 | src/ui/workshop/DragUI.tsx | Drag UI maps SVG position to pitch and filter change | pnpm build && browser audio smoke | pending |
| T063 | ready | Codex | T058 | src/ui/workshop/BowUI.tsx | Bow UI supports hold-drag legato behavior | pnpm build && browser audio smoke | pending |
| T064 | ready | Codex | T058 | src/engine/MidiInput.ts | Web MIDI input maps noteOn/noteOff to AudioEngine | pnpm test midiInput && browser MIDI smoke | pending |
| **P10** | **ready** | CEO Agent | varies | phase marker | **Decay and lineage** | see tasks below | pending |
| T065 | ready | Codex | T025,T044 | src/engine/DecayEngine.ts | Workshop play increments playCount only when Decay enabled | pnpm test decayEngine | pending |
| T066 | ready | Codex | T065 | src/engine/DecayEngine.ts | Decay mutates configured vectors using seeded randomness and clamps output | pnpm test decayEngine | pending |
| T067 | ready | Codex | T065,T043 | src/ui/common/DecayIndicator.tsx | Decay indicator shows remaining life and OFF state clearly | pnpm build | pending |
| T068 | ready | Codex | T065 | src/engine/AudioEngine.ts | Instrument at playCount >= lifespan becomes dead and silent | pnpm test audioEngine decayEngine | pending |
| T069 | ready | Codex | T033,T045 | src/ui/workshop/GenerationPanel.tsx | Generation button activates at <=50% life and creates child instrument | pnpm build && browser smoke | pending |
| T070 | ready | Codex | T034,T045 | src/ui/workshop/CrossbreedPanel.tsx | Crossbreed selects two parents and creates child with both parent IDs | pnpm build && browser smoke | pending |
| **P11** | **ready** | CEO Agent | varies | phase marker | **Studio composition** | see tasks below | pending |
| T071 | ready | Codex | T046,T025 | src/engine/Sequencer.ts | Sequencer schedules tracks with Tone.Transport and loop bounds | pnpm test sequencer | pending |
| T072 | ready | Codex | T071 | src/ui/pages/StudioPage.tsx | Studio opens selected song and creates a new song | pnpm build && browser smoke | pending |
| T073 | ready | Codex | T072,T007 | src/ui/studio/GridSequencer.tsx | Grid shows selected scale notes and 16th-note cells | pnpm build && browser smoke | pending |
| T074 | ready | Codex | T073 | src/ui/studio/GridSequencer.tsx | Cell click toggles notes and drag paints notes | pnpm build && browser smoke | pending |
| T075 | ready | Codex | T072 | src/ui/studio/TrackPanel.tsx | Tracks assign instruments, mute, solo, volume, max 8 | pnpm build && browser smoke | pending |
| T076 | ready | Codex | T071,T072 | src/ui/studio/TransportBar.tsx | Play, stop, loop, BPM, bar count controls work | pnpm build && browser audio smoke | pending |
| T077 | ready | Codex | T073 | src/ui/studio/ScaleSelector.tsx | Scale selector supports all ScaleType values | pnpm build | pending |
| T078 | ready | Codex | T071,T065 | src/engine/Sequencer.ts | Studio playback never increments instrument Decay | pnpm test sequencer decayEngine | pending |
| **P12** | **ready** | CEO Agent | varies | phase marker | **WAV export and song ownership** | see tasks below | pending |
| T079 | ready | Codex | T071 | src/engine/WavExport.ts | Tone.Offline renders song length correctly | pnpm test wavExport && browser smoke | pending |
| T080 | ready | Codex | T079 | src/engine/audioBufferToWav.ts | AudioBuffer converts to valid WAV blob | pnpm test wavExport | pending |
| T081 | ready | Codex | T079,T072 | src/ui/studio/TransportBar.tsx | Export WAV downloads named file | pnpm build && browser smoke | pending |
| T082 | ready | Codex | T046 | src/ui/studio/SongManager.tsx | Songs can be saved, loaded, renamed, duplicated, and deleted | pnpm build && browser smoke | pending |
| T083 | ready | Codex | T071,T065 | src/engine/SongDecay.ts | Song Decay mode mutates playback independently from instrument Decay | pnpm test songDecay | pending |
| **P13** | **ready** | CEO Agent | varies | phase marker | **Settings and data management** | see tasks below | pending |
| T084 | ready | Codex | T044 | src/ui/pages/SettingsPage.tsx | Settings show API key source, Decay OFF default, time sensitivity, scale | pnpm build | pending |
| T085 | ready | Codex | T044 | src/ui/pages/SettingsPage.tsx | Settings never display actual env key value | pnpm test settings security | pending |
| T086 | ready | Codex | T015 | src/ui/settings/DataManagement.tsx | Export JSON downloads full collection excluding API key | pnpm build && browser smoke | pending |
| T087 | ready | Codex | T016 | src/ui/settings/DataManagement.tsx | Import JSON validates and merges collection | pnpm build && browser smoke | pending |
| T088 | ready | Codex | T017 | src/ui/settings/DataManagement.tsx | Delete all requires confirmation and clears local data | pnpm build && browser smoke | pending |
| **P14** | **ready** | CEO Agent | varies | phase marker | **UX polish and accessibility** | see tasks below | pending |
| T089 | ready | Codex | T048,T052,T072,T084 | src/styles.css, src/ui/common/** | Museum/specimen room visual system is consistent | pnpm build && screenshot review | pending |
| T090 | ready | Codex | T089 | src/ui/common/Navigation.tsx | Navigation is obvious for a composition beginner | pnpm build && browser smoke | pending |
| T091 | ready | Codex | T089 | src/ui/common/EmptyStates.tsx | Empty and error states explain next action without jargon | pnpm build | pending |
| T092 | ready | Codex | T089 | src/ui/common/LoadingStates.tsx | AI generation and audio startup states are calm and informative | pnpm build | pending |
| T093 | ready | Codex | T089 | src/ui/**, src/styles.css | Keyboard focus and basic ARIA labels cover interactive controls | pnpm build && accessibility smoke | pending |
| **P15** | **ready** | CEO Agent | varies | phase marker | **Testing and final verification** | see tasks below | pending |
| T094 | ready | Codex | T018-T093 | tests/** | Critical utilities and engines have unit coverage | pnpm test | pending |
| T095 | ready | Codex | T094 | tests/** | AI invalid JSON, storage import failure, dead instrument, MIDI absence negative paths covered | pnpm test | pending |
| T096 | ready | Codex | T094 | scripts/verify.mjs | verify runs lint, typecheck, test, build, audit in order | pnpm verify | pending |
| T097 | ready | Claude Reviewer | T096 | docs/issues.md, docs/decisions.md, tasks.md | Cross-review checks new external API, audio engine, data export, 300+ line diffs | manual review + pnpm verify | pending |
| T098 | ready | CEO Agent | T097 | tasks.md, docs/state.md, HANDOFF-JA.md | All task evidence reconciles with git reality | pnpm audit:project && git status | pending |
| T099 | ready | Codex | T098 | README.md | Final local run and GitHub push instructions match actual scripts | pnpm verify && git diff --check | pending |
| T100 | ready | CEO Agent | T099 | all | Final artifact passes complete missing-scope audit | pnpm verify | pending |

## Blockers

| ID | Task | Blocker | Needed decision | Owner |
|---|---|---|---|---|
| B001 | T029 | Gemini API key is local secret | Create `.env.local` from `.env.example` | Human |
| B002 | T064 | Web MIDI permission/device availability | Test with actual MIDI keyboard or mark browser smoke as unavailable | Human/Codex |

## Review Notes

| Task | Reviewer | Result | Follow-up |
|---|---|---|---|
| T097 | Claude Reviewer | pending | Critical final validation |

## Evidence Rules
- Evidence must include command, result, and changed files.
- Browser smoke evidence may be text notes or screenshots.
- Do not mark a task verified without evidence.
- If implementation changes task scope, update this ledger before continuing.