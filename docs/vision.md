# vision.md -- Unknown Instruments Product North Star

## Purpose
Unknown Instruments is a local-only browser application that turns a text description of an imagined sound into a fictional instrument, lets the user play it, compose with it, and watch it decay over time.

## Target User
- Primary user: the repository owner, working locally on an ordinary notebook PC with Chrome.
- Skill level: composition beginner.
- Usage style: personal creative exploration and development record through GitHub.

## Success Criteria
1. A user can enter text and generate a fictional instrument with a coherent name, physical description, visual form, playable interface, and Tone.js sound.
2. Generated instruments look distinctive enough to feel like museum artifacts, fantasy organisms, or crystalline relics.
3. Generated sounds are pleasant enough to listen to repeatedly and feel plausibly related to the input text.
4. Every supported synth type, effect type, SVG template, play UI, Decay path, lineage path, and Studio path is implemented.
5. A composition beginner can create a short loop without reading a manual.
6. Songs can be saved, loaded, exported as WAV, exported/imported as JSON, and deleted.
7. The app runs locally without a server, GPU, login, billing, or production deploy.
8. `pnpm verify` passes before final completion.

## Non-goals
- Public deployment.
- Multi-user accounts.
- Cloud storage.
- Payment, billing, or monetization.
- Professional DAW parity.
- Perfect physical simulation of real instruments.
- Guarantee that AI output exactly matches subjective sound language.

## Product Principles
- Sound quality and visual identity are the product.
- AI hallucination is treated as creative material, not a defect.
- The app must remain approachable for a composition beginner.
- Generated output must be validated before it touches audio, storage, or UI.
- Decay starts OFF by default but is fully implemented.
- Dead instruments become ruins and no longer make sound.
- Studio playback never consumes instrument lifespan.
- Local ownership matters: export, import, delete, and GitHub history are first-class.

## Primary User Flows
1. First launch → Tap to Start → Gallery.
2. Configure `.env.local` Gemini API key → generate instrument from text.
3. Inspect generated name, material, shape, visual, sound, and play UI.
4. Play instrument using keys, slide, tap, drag, bow, or MIDI input.
5. Save snapshots and adjust synth/filter/effects.
6. Create descendants through generation and crossbreeding.
7. Open Studio → choose instruments → compose loop → save song → export WAV.
8. Export/import full collection JSON and delete local data when desired.

## UX Reference Allocation
- Chrome Music Lab Song Maker: beginner-friendly composition simplicity.
- BeepBox: lightweight browser composition and shareable loop mental model.
- Ableton Note: music-creation flow, track handling, clip-like immediacy, effects affordances.
- Teenage Engineering OP-1 field: instrument-object beauty, restraint, tactile product identity.

## Visual Direction
- Museum specimen room.
- Unknown relics.
- Fantasy organisms.
- Crystalline instruments.
- Clean enough for a modern software instrument, strange enough to feel impossible.

## Sound Direction
- Pleasant, listenable, expressive.
- Strong text-to-sound believability.
- All categories supported: metallic, string/pluck, wind-like, percussion-like, organic/voice-like, noise/environmental.

## Failure Cases
- AI returns invalid JSON.
- AI returns plausible JSON but semantically weak sound.
- AudioContext is suspended by browser policy.
- Tone.js object graph leaks after instrument switching.
- MIDI device permission is absent.
- Export/import corrupts collection data.
- Studio timing drifts or produces stuck notes.
- Decay destroys a favorite instrument unexpectedly.
- Generated SVG looks too generic.

## Relationship to tasks.md
- This file defines product intent.
- `tasks.md` defines executable implementation work.
- Store task progress and evidence in `tasks.md`.
- Store only the current pointer in `docs/state.md`.
