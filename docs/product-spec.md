# product-spec.md -- Unknown Instruments Complete Product Contract

## Confirmed Requirements
- Repository: `snowtone-ai/Unknown-Instruments`.
- Use: local-only, owner-only.
- Deployment: not required.
- Scope: complete implementation, not MVP-only.
- API key: `.env.local`.
- Default Decay: OFF.
- Dead instruments: no sound.
- Studio, WAV export, save/load, JSON export/import/delete: required.
- MIDI keyboard: required.
- All play UIs: keys, slide, tap, drag, bow.
- All SVG templates: stringed, wind, percussion, crystalline, organic, spiral.
- All synth families: fm, am, mono, pluck, metal.
- All effect families: reverb, distortion, delay, chorus, tremolo, autofilter.

## Quality Bar
- Instrument visuals must be strong enough to show externally as generated artifacts.
- Sounds must be listenable, not merely technically audible.
- Text-to-sound relation must be understandable by a human listener after reading the description.
- Composition UI must assume the user has no composition experience.

## Local Environment
- Vite + React + TypeScript.
- Tone.js for browser audio.
- Gemini API through browser fetch.
- localStorage first, IndexedDB for larger collections.
- Chrome recommended.

## External References to Verify During Implementation
- Vite official guide.
- Tone.js official docs.
- Gemini API structured output docs.
- Chrome autoplay/Web Audio policy.
- Web MIDI API browser support before MIDI implementation.
