# issues.md -- Failure Log

| ID | Date | Area | Symptom | Root Cause | Resolution | Status |
|---|---|---|---|---|---|---|
| I001 | 2026-06-02 | Scaffold | No implementation failures yet | Initial repository artifact | None | closed |
| I002 | 2026-06-02 | Hardening review | Corrupted local data or user-edited imports could crash hydration/render paths | Persistence/import trusted JSON shape too much | Added storage parse recovery, data sanitizers, import error UI, SVG color normalization, ErrorBoundary, and boundary tests | closed |
| I003 | 2026-06-02 | Gemini integration | Structured output request shape risked drifting from current Gemini REST docs | Request used older `responseMimeType`/`responseSchema` form | Updated to `generationConfig.responseFormat.text.mimeType/schema` and added request-shape test | closed |
| I004 | 2026-06-02 | Studio playback | Play state could finish immediately while scheduled notes continued | `Sequencer.play()` returned after scheduling timers | Made playback promise resolve on stop/end and clamped tempo for playback/export | closed |
