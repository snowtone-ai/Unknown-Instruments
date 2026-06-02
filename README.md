# Unknown Instruments

Local-only browser app for generating, playing, composing with, and preserving fictional instruments.

## Confirmed repository

```bash
git@github.com:snowtone-ai/Unknown-Instruments.git
```

## Local setup

```bash
cd ~/project
# If the GitHub repository is empty:
git clone git@github.com:snowtone-ai/Unknown-Instruments.git
cd Unknown-Instruments

# Copy this artifact's files into the repository root, then:
pnpm install
node scripts/setup.mjs
```

Edit `.env.local` locally:

```bash
VITE_GEMINI_API_KEY=your_key_here
VITE_GEMINI_MODEL=gemini-2.5-flash
```

Run locally:

```bash
pnpm dev
```

Open `http://127.0.0.1:5173`, press `Start Audio`, then use Workshop to generate an instrument.

Verify:

```bash
pnpm verify
```

Push initial scaffold:

```bash
git add .
git commit -m "chore: initialize unknown instruments repository"
git push -u origin main
```

## pm-zero files

- `docs/vision.md`: product north star.
- `tasks.md`: executable implementation ledger.
- `docs/state.md`: current pointer.
- `docs/decisions.md`: permanent decisions.
- `docs/issues.md`: failure log.
- `docs/repo-map.md`: repository navigation.
- `AGENTS.md`: shared agent rules.
- `scripts/verify.mjs`: unified verification.

## Product status

Implemented local product flows:

- Gemini `gemini-2.5-flash` JSON generation with schema validation, clamping, recovery, and local fallback.
- Tone.js synth factory, effects, audio startup overlay, playback lifecycle, PluckSynth pool, sequencer, and WAV encoding.
- Gallery, Workshop, Studio, and Settings pages.
- Six parametric SVG templates: stringed, wind, percussion, crystalline, organic, spiral.
- Decay, time sensitivity, snapshots, lineage, generation succession, and crossbreeding.
- localStorage persistence with IndexedDB fallback for large records.
- Collection export/import excluding API keys.

Known browser limitations:

- Audio starts only after a user gesture.
- Web MIDI requires Chrome permission and a connected MIDI device.
- `.env.local` is local-only and must not be committed.
