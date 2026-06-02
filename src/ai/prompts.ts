export function buildInstrumentPrompt(userInput: string): string {
  return `あなたは架空の楽器設計者です。ユーザーが記述した音のイメージに対応する、現実に存在しない架空の楽器を設計してください。

制約:
- 現実に存在しない楽器であること
- 物理的にはギリギリ成立しそうな構造にすること
- 楽器名は造語で付けること
- 音響パラメータはTone.jsで再生可能な現実的数値にすること
- JSONのみで返すこと
- 次のキーを必ず含めること: instrument, synth, filter, effects, visual, interaction, decay_profile
- synth.type は fm, am, mono, pluck, metal のいずれか
- visual.template は stringed, wind, percussion, crystalline, organic, spiral のいずれか
- interaction.type は keys, slide, tap, drag, bow のいずれか

音のイメージ:
${userInput}

返却JSON例:
{
  "instrument": {
    "name": "造語名（読み）",
    "name_etymology": "語源説明",
    "description": "物理構造と奏法の説明を2-3文",
    "materials": ["素材1", "素材2", "素材3"],
    "shape": "形状説明",
    "playing_method": "奏法説明"
  },
  "synth": {
    "type": "fm",
    "oscillator_type": "sine",
    "harmonicity": 3,
    "modulation_index": 8,
    "modulation_type": "sine",
    "attack_noise": 4,
    "dampening": 4000,
    "resonance": 0.6,
    "octaves": 1.5,
    "attack": 0.08,
    "decay": 0.3,
    "sustain": 0.45,
    "release": 1.4,
    "base_frequency": 220
  },
  "filter": { "type": "lowpass", "frequency": 1800, "q": 2.5 },
  "effects": [{ "type": "reverb", "wet": 0.35, "decay_time": 2.8 }],
  "visual": {
    "template": "crystalline",
    "primary_color": "#6f6654",
    "accent_color": "#d6b66f",
    "texture": "crystalline",
    "complexity": 3,
    "element_count": 7,
    "form_description": "自然言語の形状説明"
  },
  "interaction": { "type": "keys", "description": "操作方法" },
  "decay_profile": {
    "lifespan": 60,
    "primary_decay_target": "filter.frequency",
    "decay_character": "crystallization"
  }
}`;
}
