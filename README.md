# Unknown Instruments

> 言葉から架空の楽器を生み出し、演奏し、作曲し、やがて朽ちるのを見届けるブラウザアプリ。
>
> *Type a description of an imagined sound. An impossible instrument appears.*

---

## What it is

You write something like *"the vibration of crystals resonating in deep water"* and the app conjures a fictional instrument — a name with etymology, a physical description, a unique procedural SVG specimen, and a playable Tone.js sound.

Every instrument has a lifespan. Play it enough and it decays: the sound shifts, cracks spread across the visual, and eventually it becomes a silent ruin. You can breed instruments together, compose short songs with a step sequencer, and export everything as WAV or JSON.

No accounts. No cloud. Runs entirely in the browser.

---

## Features

| | |
|---|---|
| **Text → instrument** | Gemini API generation with schema validation; offline fallback works without a key |
| **6 visual templates** | Stringed · Wind · Percussion · Crystalline · Organic · Spiral — procedurally varied by color seed and complexity |
| **5 play modes** | Keys · Slide · Tap · Drag · Bow |
| **Decay system** | Each instrument has a lifespan; play count drives oxidation, erosion, crystallization, withering, or dissolution |
| **Lineage** | Produce successors; crossbreed two instruments into a child |
| **Snapshots** | Save and restore synth/filter/effects states |
| **Studio** | Multi-track step sequencer — BPM, time signature, per-track volume / mute / solo |
| **WAV export** | Offline bounce to `.wav` directly in the browser |
| **JSON backup** | Export and import your entire collection (API key excluded) |

---

## Quick start

**Requirements:** Node 20+, pnpm

```bash
git clone https://github.com/snowtone-ai/Unknown-Instruments.git
cd Unknown-Instruments
pnpm install
pnpm dev
```

Open **http://127.0.0.1:5173** → **Tap to Begin** → **Workshop** → type a sound description → **Generate**.

### Gemini API key (optional)

The app works offline with a local fallback generator. For AI generation, create `.env.local`:

```bash
VITE_GEMINI_API_KEY=your_key_here
VITE_GEMINI_MODEL=gemini-2.5-flash
```

Or enter the key at runtime in the **Settings** page — it stays in your browser and is never exported.

---

## Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript + Vite 7 |
| Audio | Tone.js (Web Audio API) |
| State | Zustand with localStorage / IndexedDB persistence |
| Visuals | Procedural SVG — no canvas, no WebGL |
| AI | Google Gemini API (`gemini-2.5-flash`) |

---

## Project layout

```
src/
  ai/       Gemini client · fallback generator · crossbreed · schema validator
  engine/   AudioEngine · Sequencer · DecayEngine · WAV export · TimeSensitivity
  stores/   Zustand store + persistence layer
  types/    Shared TypeScript interfaces
  ui/       Pages (Gallery · Workshop · Studio · Settings) and components
  utils/    MIDI helpers · scale tables · decay math · ID generation
  visual/   SVG templates · InstrumentRenderer · DecayOverlay · visual utilities
```

---

## Commands

```bash
pnpm dev        # dev server → http://127.0.0.1:5173
pnpm build      # production build
pnpm typecheck  # tsc --noEmit
pnpm lint       # ESLint
pnpm test       # Vitest
pnpm verify     # typecheck + lint + test + build (full gate)
```

---

## Design language

Warm dark palette, gold accents, restrained typography. The aesthetic is **museum specimen room** — as if the instruments were excavated from an undiscovered civilization and put on display. Strange enough to feel impossible, clean enough to feel like software.

UX references: Chrome Music Lab · BeepBox · Ableton Note · Teenage Engineering OP-1 field

---

## Notes

- Audio starts only after a user gesture (browser policy).
- Web MIDI requires Chrome permission and a connected device.
- `.env.local` is gitignored and must never be committed.

---

## License

MIT
