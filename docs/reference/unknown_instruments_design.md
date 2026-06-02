# Unknown Instruments 設計書 v1.1

> 最終更新: 2026/06/02
> ステータス: 要件定義完了 → 実装準備段階

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロダクト名 | Unknown Instruments |
| コンセプト | テキストから架空の楽器を生成し、演奏・作曲する |
| 開発規模 | 1人・趣味開発 |
| 収益化 | なし |
| 金銭コスト | Gemini API無料枠を前提（制限超過時のみ従量課金） |
| 優先事項 | 音質 > 体験の新しさ > 作曲機能 > UIの洗練 |

### 制約条件

- サーバー: 不要（完全クライアントサイド）
- GPU: 不要
- 動作環境: 普通のノートPC + モダンブラウザ（Chrome推奨）
- 外部依存: Tone.js（MIT）、Gemini API（無料枠を前提）
- Gemini API利用にはAPIキーが必要（ユーザーが自身のキーを設定画面で入力）
- Claude Artifact化は採用しない（localStorage/IndexedDB前提をwindow.storageへ置き換える必要があり、単一ファイル寄りの構成制約が大きいため）

---

## 2. コンセプト

### 核心体験

「夜明け前の空気が割れるような音」と書くと、AIがその音を奏でる架空の楽器を設計し、ブラウザ上に出現させ、実際に鳴らせる。作った楽器で作曲もできる。楽器は演奏するたびに少しずつ朽ちていく。

### 3つの体験レイヤー

1. **発見**: テキストから楽器が生まれる驚き
2. **演奏**: 楽器ごとに異なる操作で音を出す喜び
3. **創作**: 架空の楽器群で音楽を作曲する達成感

### 独自性

- AIのハルシネーションが欠陥ではなく機能として作用する稀有な設計
- テキスト→物理設計→ビジュアル→音色→操作方法が一貫したパイプラインで生成される
- デジタルなのに朽ちる楽器（Decay）という異質な体験
- 「存在しない楽器で本物の音楽を作る」という矛盾の実現

---

## 3. 技術スタック

| レイヤー | 技術 | 選定理由 |
|---------|------|---------|
| フレームワーク | React 18 + TypeScript | 複数画面・状態管理の複雑さに対応 |
| ビルドツール | Vite | 高速・ゼロ設定・無料 |
| 音響エンジン | Tone.js | FM/AM/物理モデリング合成、シーケンサー、エフェクトチェーン内蔵。Chrome Music Labでも採用実績あり |
| AI処理 | Gemini API (gemini-2.5-flash) | 無料枠、Structured Outputs、JSON生成精度。Claude APIは将来の高品質生成モードとして任意追加 |
| 楽器ビジュアル | SVG（React内インライン生成） | パラメトリック生成・Decayアニメーション・軽量 |
| データ永続化 | localStorage + IndexedDB（大量データ時） | サーバー不要。5MB超のコレクションにはIndexedDB |
| 音声エクスポート | Tone.Offline + WAVエンコード | ブラウザ内でオフラインレンダリング→ダウンロード |

---

## 4. システムアーキテクチャ

### モジュール構成

```
src/
├── main.tsx                    # エントリポイント
├── App.tsx                     # ルーティング・グローバル状態
├── types/                      # 全TypeScript型定義
│   └── index.ts
├── stores/                     # 状態管理（React Context or Zustand）
│   ├── instrumentStore.ts      # 楽器コレクション
│   ├── songStore.ts            # 楽曲データ
│   └── settingsStore.ts        # 設定（APIキー、Decay ON/OFF等）
├── engine/                     # 音響エンジン
│   ├── AudioEngine.ts          # Tone.jsラッパー・楽器インスタンス管理
│   ├── SynthFactory.ts         # AIパラメータ→Tone.jsシンセ変換
│   ├── EffectChain.ts          # エフェクトチェーン構築
│   ├── DecayEngine.ts          # Decayパラメータ変異処理
│   ├── TimeSensitivity.ts      # 時刻感応パラメータ補正
│   └── Sequencer.ts            # グリッドシーケンサー再生エンジン
├── ai/                         # AI統合
│   ├── GeminiClient.ts         # API呼び出し・レート制限管理
│   ├── prompts.ts              # プロンプトテンプレート
│   ├── validator.ts            # JSONスキーマ検証・数値クランプ
│   └── reverseGenerator.ts     # 音→テキスト逆生成
├── visual/                     # SVGビジュアルエンジン
│   ├── InstrumentRenderer.tsx  # SVGテンプレート選択・描画
│   ├── templates/              # SVGテンプレート群
│   │   ├── StringedTemplate.tsx
│   │   ├── WindTemplate.tsx
│   │   ├── PercussionTemplate.tsx
│   │   ├── CrystallineTemplate.tsx
│   │   ├── OrganicTemplate.tsx
│   │   └── SpiralTemplate.tsx
│   └── DecayOverlay.tsx        # Decay視覚エフェクト（ひび割れ・退色）
├── ui/                         # UIコンポーネント
│   ├── pages/
│   │   ├── GalleryPage.tsx     # 楽器回廊（ホーム）
│   │   ├── WorkshopPage.tsx    # 楽器工房（生成・演奏）
│   │   ├── StudioPage.tsx      # 作曲スタジオ
│   │   └── SettingsPage.tsx    # 設定
│   ├── workshop/
│   │   ├── TextInput.tsx       # 音のイメージ入力
│   │   ├── InstrumentCard.tsx  # 楽器情報表示
│   │   ├── PlayUI.tsx          # 演奏UIコンテナ（interaction.typeで分岐）
│   │   ├── KeysUI.tsx          # 鍵盤UI
│   │   ├── SlideUI.tsx         # スライドUI
│   │   ├── TapUI.tsx           # タップパッドUI
│   │   ├── DragUI.tsx          # ドラッグUI
│   │   ├── BowUI.tsx           # ボウ（弓引き）UI
│   │   └── SnapshotPanel.tsx   # スナップショット管理
│   ├── studio/
│   │   ├── GridSequencer.tsx   # グリッドシーケンサー本体
│   │   ├── TrackPanel.tsx      # トラック管理
│   │   ├── TransportBar.tsx    # 再生・テンポ・エクスポート
│   │   └── ScaleSelector.tsx   # スケール選択
│   ├── gallery/
│   │   ├── InstrumentTile.tsx  # 楽器タイル（サムネイル+状態）
│   │   ├── LineageTree.tsx     # 系譜樹表示
│   │   └── RuinsView.tsx       # 朽ちた楽器の遺跡表示
│   └── common/
│       ├── Navigation.tsx      # 3タブナビゲーション
│       └── DecayIndicator.tsx  # 寿命インジケーター
├── data/                       # データ永続化
│   ├── storage.ts              # localStorage/IndexedDB抽象化
│   └── exportImport.ts         # JSONエクスポート/インポート
└── utils/
    ├── midi.ts                 # MIDIノート番号↔周波数変換
    ├── scales.ts               # 音楽スケール定義
    └── decay.ts                # Decay計算ユーティリティ
```

### データフロー

```
[テキスト入力]
      ↓
[Gemini API] → 生JSON
      ↓
[Validator] → 検証済みJSON（数値クランプ・型チェック）
      ↓
[SynthFactory] → Tone.jsシンセインスタンス
[InstrumentRenderer] → SVGビジュアル
[PlayUI] → interaction.typeに応じた演奏UI
      ↓
[演奏操作] → MIDIノートデータ {note, velocity, type}
      ↓                              ↓
[AudioEngine] → 発音              [Sequencer] → グリッドに記録
      ↓
[DecayEngine] → パラメータ変異（Decay ON時）
```

---

## 5. データモデル

```typescript
// ===== 楽器 =====
interface Instrument {
  id: string;                    // UUID
  name: string;                  // 造語の楽器名
  nameEtymology: string;        // 語源
  description: string;           // 物理構造と奏法の説明
  materials: string[];           // 素材リスト
  shape: string;                 // 形状の説明
  playingMethod: string;         // 奏法の説明
  originText: string;            // ユーザーが入力した音のイメージテキスト

  synth: SynthParams;            // 音響合成パラメータ
  filter: FilterParams;          // フィルターパラメータ
  effects: EffectParams[];       // エフェクトチェーン
  visual: VisualParams;          // SVG描画パラメータ
  interaction: InteractionParams;// 操作UI設定

  decay: DecayState;             // Decay状態
  lineage: LineageInfo;          // 系譜情報
  snapshots: Snapshot[];         // 保存済みスナップショット

  createdAt: number;             // 作成日時（Unix ms）
  lastPlayedAt: number | null;   // 最終演奏日時
}

// ===== 音響合成 =====
interface SynthParams {
  type: 'fm' | 'am' | 'mono' | 'pluck' | 'metal';

  // 共通（pluck/metal以外）
  oscillatorType?: 'sine' | 'sawtooth' | 'square' | 'triangle';

  // FM/AM/Metal用
  harmonicity?: number;          // 0.5 - 10
  modulationIndex?: number;      // 1 - 20（FM/Metalのみ）
  modulationType?: 'sine' | 'sawtooth' | 'square' | 'triangle';

  // Pluck用
  attackNoise?: number;          // 1 - 20
  dampening?: number;            // 1000 - 8000（Hz）
  resonance?: number;            // 0.1 - 1.0

  // Metal用
  octaves?: number;              // 0.5 - 4

  // エンベロープ（共通）
  attack: number;                // 0.001 - 3.0（秒）
  decay: number;                 // 0.01 - 2.0（秒）
  sustain: number;               // 0.0 - 1.0
  release: number;               // 0.01 - 5.0（秒）

  // ベース周波数（演奏UIの基準音）
  baseFrequency: number;         // 55 - 880（Hz）。MIDI noteに変換して使用
}

interface FilterParams {
  type: 'lowpass' | 'highpass' | 'bandpass';
  frequency: number;             // 80 - 12000（Hz）
  q: number;                     // 0.5 - 15
}

interface EffectParams {
  type: 'reverb' | 'distortion' | 'delay' | 'chorus' | 'tremolo' | 'autofilter';
  wet: number;                   // 0.0 - 1.0

  // Reverb
  decayTime?: number;            // 0.5 - 10.0（秒）

  // Distortion
  distortion?: number;           // 0.0 - 1.0

  // Delay
  delayTime?: number;            // 0.05 - 1.0（秒）
  feedback?: number;             // 0.0 - 0.9

  // Chorus / Tremolo / AutoFilter
  frequency?: number;            // 0.1 - 20（Hz）
  depth?: number;                // 0.0 - 1.0

  // AutoFilter追加
  baseFrequency?: number;        // 100 - 4000（Hz）
  filterOctaves?: number;        // 0.5 - 6
}

// ===== ビジュアル =====
interface VisualParams {
  template: 'stringed' | 'wind' | 'percussion' | 'crystalline' | 'organic' | 'spiral';
  primaryColor: string;          // Hex
  accentColor: string;           // Hex
  texture: 'smooth' | 'rough' | 'metallic' | 'organic' | 'crystalline';
  complexity: number;            // 1 - 5（描画の細密度）
  elementCount: number;          // 1 - 12（弦の本数、管の数など）
  formDescription: string;       // AIが記述した形状の自然言語説明
}

// ===== 操作UI =====
interface InteractionParams {
  type: 'keys' | 'slide' | 'tap' | 'drag' | 'bow';
  description: string;           // 奏法の自然言語説明
}

// ===== Decay =====
interface DecayState {
  lifespan: number;              // 総演奏可能回数（30 - 100）
  playCount: number;             // 現在の演奏回数
  decayVectors: DecayVector[];   // 劣化方向ベクトル
  decayCharacter: 'oxidation' | 'erosion' | 'crystallization' | 'withering' | 'dissolution';
  seed: number;                  // 劣化の一意性を担保する乱数シード
  isDead: boolean;               // 完全に朽ちたか
}

interface DecayVector {
  paramPath: string;             // 例: "synth.harmonicity", "filter.frequency"
  direction: 1 | -1;            // 増加方向 or 減少方向
  weight: number;                // 0.1 - 1.0（劣化の強さ）
}

// ===== 系譜 =====
interface LineageInfo {
  parentId: string | null;       // 親楽器ID（null = 初代）
  generation: number;            // 世代番号（1 = 初代）
  childIds: string[];            // 子楽器IDリスト
  crossbreedParentIds?: [string, string]; // 交配の場合の両親ID
}

// ===== スナップショット =====
interface Snapshot {
  id: string;
  label: string;                 // ユーザーが付けるラベル（任意）
  synth: SynthParams;            // 凍結されたパラメータ
  filter: FilterParams;
  effects: EffectParams[];
  visual: VisualParams;
  playCountAtCapture: number;    // 撮影時の演奏回数
  createdAt: number;
}

// ===== 楽曲 =====
interface Song {
  id: string;
  name: string;
  tempo: number;                 // 60 - 240 BPM
  scale: ScaleType;
  timeSignature: [number, number]; // [拍子の分子, 分母] 例: [4, 4]
  barCount: number;              // 1 - 16
  tracks: Track[];
  loop: boolean;

  // 楽曲Decayモード
  decayMode: boolean;
  decayStartedAt: number | null; // Decay開始日時
  decayRatePerDay: number;       // 1日あたりの劣化率 0.01 - 0.1

  createdAt: number;
}

interface Track {
  id: string;
  instrumentId: string;          // 使用楽器のID
  notes: Note[];
  volume: number;                // 0.0 - 1.0
  muted: boolean;
  solo: boolean;
}

interface Note {
  pitch: number;                 // MIDIノート番号（0-127）
  startBeat: number;             // 開始位置（拍単位、小数可）
  duration: number;              // 長さ（拍単位）
  velocity: number;              // 0.0 - 1.0
}

type ScaleType =
  | 'chromatic'
  | 'major'
  | 'minor'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'dorian'
  | 'mixolydian'
  | 'blues'
  | 'whole_tone';

// ===== 設定 =====
interface AppSettings {
  apiKey: string;                // Gemini APIキー（ローカル保存）
  decayEnabled: boolean;         // Decay ON/OFF（グローバル）
  timeSensitivityEnabled: boolean; // 時刻感応 ON/OFF
  defaultScale: ScaleType;
  language: 'ja' | 'en';
}
```

---

## 6. 音響エンジン仕様

### 6.1 SynthFactory: AIパラメータ → Tone.js変換

AIが生成したJSONの`synth.type`に基づき、以下のTone.jsクラスをインスタンス化する。

| synth.type | Tone.jsクラス | 音色特性 |
|-----------|--------------|---------|
| `fm` | `Tone.PolySynth(Tone.FMSynth)` | 金属的・ベル的・複雑な倍音。最も音色幅が広い |
| `am` | `Tone.PolySynth(Tone.AMSynth)` | トレモロ的・脈動する・うねりのある音 |
| `mono` | `Tone.PolySynth(Tone.MonoSynth)` | 減算合成。フィルターエンベロープで音色変化 |
| `pluck` | `Tone.PluckSynth`（複数インスタンス） | 撥弦。Karplus-Strong物理モデリング |
| `metal` | `Tone.PolySynth(Tone.MetalSynth)` | 非整数倍音。ゴング・シンバル的 |

**変換ルール（SynthFactory.ts）:**

```typescript
function createSynth(params: SynthParams): Tone.PolySynth | Tone.PluckSynth {
  switch (params.type) {
    case 'fm':
      return new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: params.harmonicity ?? 3,
        modulationIndex: params.modulationIndex ?? 10,
        oscillator: { type: params.oscillatorType ?? 'sine' },
        modulation: { type: params.modulationType ?? 'sine' },
        envelope: {
          attack: params.attack,
          decay: params.decay,
          sustain: params.sustain,
          release: params.release,
        },
      });
    case 'pluck':
      // PluckSynthはPolySynth非対応のため、8インスタンスをプール管理
      // ラウンドロビンで発音
      return createPluckPool(params, 8);
    // ... 他のtype
  }
}
```

### 6.2 エフェクトチェーン

楽器ごとに最大4つのエフェクトを直列接続する。

```
Synth → Filter → Effect1 → Effect2 → ... → Destination
```

| エフェクトtype | Tone.jsクラス | 主要パラメータ |
|--------------|-------------|--------------|
| `reverb` | `Tone.Reverb` | decay（秒）, wet |
| `distortion` | `Tone.Distortion` | distortion（0-1）, wet |
| `delay` | `Tone.FeedbackDelay` | delayTime（秒）, feedback, wet |
| `chorus` | `Tone.Chorus` | frequency, depth, wet |
| `tremolo` | `Tone.Tremolo` | frequency, depth, wet |
| `autofilter` | `Tone.AutoFilter` | frequency, baseFrequency, octaves, wet |

### 6.3 パラメータ検証・クランプルール

AIの出力は信頼できない前提で、すべての数値をコード側で検証・クランプする。

```typescript
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function validateSynthParams(raw: any): SynthParams {
  const VALID_TYPES = ['fm', 'am', 'mono', 'pluck', 'metal'];
  const type = VALID_TYPES.includes(raw.type) ? raw.type : 'fm';

  return {
    type,
    oscillatorType: ['sine','sawtooth','square','triangle'].includes(raw.oscillator_type)
      ? raw.oscillator_type : 'sine',
    harmonicity: clamp(raw.harmonicity ?? 3, 0.5, 10),
    modulationIndex: clamp(raw.modulation_index ?? 10, 1, 20),
    attack: clamp(raw.attack ?? 0.1, 0.001, 3.0),
    decay: clamp(raw.decay ?? 0.3, 0.01, 2.0),
    sustain: clamp(raw.sustain ?? 0.5, 0.0, 1.0),
    release: clamp(raw.release ?? 1.0, 0.01, 5.0),
    baseFrequency: clamp(raw.base_frequency ?? 220, 55, 880),
    // ... 他フィールド
  };
}
```

### 6.4 ポリフォニー

- `PolySynth`のデフォルトボイス数: 8
- PluckSynthはインスタンスプール（8個）でラウンドロビン発音
- 作曲モードでは同時発音数をトラックあたり最大8に制限

### 6.5 AudioContext管理

- ブラウザの自動再生ポリシー対応: アプリ起動時に「タップして開始」オーバーレイを表示し、ユーザージェスチャー後に`Tone.start()`を呼ぶ
- AudioContextは全体で1つ共有（Tone.jsが管理）
- 楽器切り替え時はシンセインスタンスを`.dispose()`して再生成

---

## 7. AI統合仕様

### 7.1 楽器生成プロンプト

```
あなたは架空の楽器設計者です。ユーザーが記述した「音のイメージ」に対応する、現実に存在しない架空の楽器を設計してください。

<constraints>
- 現実に存在しない楽器であること
- 物理的にはギリギリ成立しそうな構造にすること（完全な嘘はNG）
- 楽器名は造語で付けること（語源の説明も含める）
- 音響パラメータはTone.jsで再生可能な現実的数値にすること
- 前回と同じ楽器・同じパラメータの繰り返しを避けること
</constraints>

以下のJSONのみで返してください。説明文・マークダウン記法・コードブロックは不要です。

<schema>
{
  "instrument": {
    "name": "造語の楽器名（カタカナ読み付き）",
    "name_etymology": "造語の語源の説明",
    "description": "楽器の物理的構造と奏法の説明（2-3文）",
    "materials": ["素材1", "素材2", "素材3"],
    "shape": "形状の説明",
    "playing_method": "奏法の説明"
  },
  "synth": {
    "type": "fm | am | mono | pluck | metal",
    "oscillator_type": "sine | sawtooth | square | triangle",
    "harmonicity": "0.5-10の数値",
    "modulation_index": "1-20の数値",
    "modulation_type": "sine | sawtooth | square | triangle",
    "attack_noise": "1-20（pluckのみ）",
    "dampening": "1000-8000（pluckのみ）",
    "resonance": "0.1-1.0（pluck/metalのみ）",
    "octaves": "0.5-4（metalのみ）",
    "attack": "0.001-3.0",
    "decay": "0.01-2.0",
    "sustain": "0.0-1.0",
    "release": "0.01-5.0",
    "base_frequency": "55-880"
  },
  "filter": {
    "type": "lowpass | highpass | bandpass",
    "frequency": "80-12000",
    "q": "0.5-15"
  },
  "effects": [
    {
      "type": "reverb | distortion | delay | chorus | tremolo | autofilter",
      "wet": "0.0-1.0",
      "decay_time": "0.5-10（reverbのみ）",
      "distortion": "0.0-1.0（distortionのみ）",
      "delay_time": "0.05-1.0（delayのみ）",
      "feedback": "0.0-0.9（delayのみ）",
      "frequency": "0.1-20（chorus/tremolo/autofilterのみ）",
      "depth": "0.0-1.0（chorus/tremolo/autofilterのみ）"
    }
  ],
  "visual": {
    "template": "stringed | wind | percussion | crystalline | organic | spiral",
    "primary_color": "#xxxxxx",
    "accent_color": "#xxxxxx",
    "texture": "smooth | rough | metallic | organic | crystalline",
    "complexity": "1-5",
    "element_count": "1-12",
    "form_description": "形状を視覚的に描写する文"
  },
  "interaction": {
    "type": "keys | slide | tap | drag | bow",
    "description": "操作方法の具体的説明"
  },
  "decay_profile": {
    "lifespan": "30-100",
    "primary_decay_target": "パラメータパス",
    "decay_character": "oxidation | erosion | crystallization | withering | dissolution"
  }
}
</schema>

<example>
音のイメージ：「湿った金属をこすったような、低く震える音」

{
  "instrument": {
    "name": "Vrelith（ヴレリス）",
    "name_etymology": "古英語の'vreon'（震える）とギリシャ語の'lithos'（石）から",
    "description": "湿った玄武岩の薄板を鹿の腱で張ったハープ型構造。奏者が指の腹でゆっくり撫でると低い振動音が出る。板の厚さにより倍音が変化する。",
    "materials": ["玄武岩", "鹿の腱", "黒檀"],
    "shape": "非対称な弓形。左側が重く、右側に向かって細くなる",
    "playing_method": "指の腹でゆっくり撫でる、または石板の端を爪で弾く"
  },
  "synth": {
    "type": "fm",
    "oscillator_type": "sawtooth",
    "harmonicity": 2.5,
    "modulation_index": 8,
    "modulation_type": "sine",
    "attack": 0.8,
    "decay": 0.4,
    "sustain": 0.6,
    "release": 2.5,
    "base_frequency": 110
  },
  "filter": {
    "type": "lowpass",
    "frequency": 600,
    "q": 3.5
  },
  "effects": [
    { "type": "reverb", "wet": 0.6, "decay_time": 4.0 },
    { "type": "tremolo", "wet": 0.5, "frequency": 2.5, "depth": 0.3 }
  ],
  "visual": {
    "template": "stringed",
    "primary_color": "#2a2a35",
    "accent_color": "#8B7355",
    "texture": "rough",
    "complexity": 3,
    "element_count": 7,
    "form_description": "非対称な弓形の暗い石の胴体から7本の腱の弦が張られている"
  },
  "interaction": {
    "type": "slide",
    "description": "画面上を指でゆっくり水平にスライドして音を出す。速度で音量が変化する"
  },
  "decay_profile": {
    "lifespan": 50,
    "primary_decay_target": "filter.frequency",
    "decay_character": "erosion"
  }
}
</example>

音のイメージ：
「{USER_INPUT}」
```

### 7.2 逆生成プロンプト（世代交代用）

```
以下は架空の楽器の現在の状態です。この楽器が発する音を想像してください。

<instrument_state>
楽器名: {name}
説明: {description}
合成方式: {synth.type}, 波形: {synth.oscillatorType}
エンベロープ: A={attack}s D={decay}s S={sustain} R={release}s
フィルター: {filter.type} {filter.frequency}Hz Q={filter.q}
エフェクト: {effects概要}
劣化率: {playCount/lifespan * 100}%
</instrument_state>

この音色が連想させる新しい音のイメージを、20-40字の日本語テキストで表現してください。
- 元の楽器の説明文をそのまま繰り返さないこと
- 具体的な感覚（触覚・視覚・温度・質量など）を含むこと
- テキストのみ返してください（JSON不要）
```

### 7.3 交配プロンプト

```
以下の2つの架空の楽器を「交配」し、両方の特徴を受け継ぐ新しい架空の楽器を設計してください。

<parent_a>
{楽器AのJSON}
</parent_a>

<parent_b>
{楽器BのJSON}
</parent_b>

設計制約：
- 両親の素材・形状・奏法から要素を受け継ぐこと
- 音響パラメータは両親の中間値を基本としつつ、突然変異的な逸脱も含むこと
- 楽器名は両親の名前を掛け合わせた新しい造語にすること
- 完全な平均ではなく、予測不能な新しさがあること

{通常の楽器生成と同じスキーマでJSONのみ返してください}
```

### 7.4 AI出力の期待値管理

リサーチにより判明した「意味のギャップ」（テキスト形容詞と音響パラメータ間の主観的・非定量的な対応関係）を踏まえ、AIが生成する音色は「完璧な再現」ではなく「創造的な出発点」として設計する。

UIに反映する方針:
- 楽器生成後、パラメータ手動調整パネル（Advanced）を提供
- 「再生成」ボタンで同じテキストから別のバリエーションを生成可能
- 生成された音色が気に入らなければ、synth.type変更などの粗調整→微調整の2段階

---

## 8. SVGビジュアルエンジン仕様

### 8.1 テンプレート一覧

AIの`visual.template`値に対応する6種類のSVGテンプレートを初期実装で一括実装する。各テンプレートはReactコンポーネントとして実装し、`VisualParams`を受け取ってSVGを返す。

| template | 形状概要 | elementCountの意味 |
|----------|---------|------------------|
| `stringed` | 胴体 + 弦 + ペグ | 弦の本数 |
| `wind` | 管 + ベル + 穴 | 管の数 or キーの数 |
| `percussion` | 板 / 膜 + スタンド | 打面の数 |
| `crystalline` | 多角形の結晶体群 | 結晶の数 |
| `organic` | 有機的な曲線・膨らみ | 突起や枝の数 |
| `spiral` | 螺旋構造 | 巻き数 |

### 8.2 パラメータ → SVG変換ルール

- `primaryColor`: 胴体・主構造の色
- `accentColor`: 弦・装飾・ハイライトの色
- `texture`: SVGフィルターで表現
  - `smooth`: なし（クリーンな面）
  - `rough`: `feTurbulence`（type="fractalNoise", baseFrequency=0.05）
  - `metallic`: `feSpecularLighting` + `feComposite`
  - `organic`: `feTurbulence`（type="turbulence", baseFrequency=0.02）
  - `crystalline`: `feSpecularLighting`（高surfaceScale）
- `complexity`: 1-5に応じて描画ディテール（パスの頂点数、装飾要素）を増減
- `formDescription`: SVGコード自体には使用しない（表示用テキスト）

### 8.3 Decay視覚エフェクト

`DecayOverlay.tsx`が楽器SVGの上にオーバーレイとして描画される。Decay進行度`p = playCount / lifespan`（0→1）に応じて:

| 進行度p | 視覚変化 |
|--------|---------|
| 0.0-0.2 | 変化なし |
| 0.2-0.4 | 彩度が`1 - (p-0.2)*1.5`に低下 |
| 0.4-0.6 | ひび割れ線（SVG path）が`decayCharacter`に応じたパターンで出現 |
| 0.6-0.8 | 色が全体的にグレーに近づく。一部の構成要素が欠落（弦が切れる、管に穴が開く等） |
| 0.8-1.0 | 大きなひび割れ。構成要素の大半が欠落。opacity低下 |
| 1.0（死亡）| 破片化アニメーション → 「遺跡」としてグレースケール残骸を表示 |

`decayCharacter`による差異:
- `oxidation`: 赤錆色の斑点が増える
- `erosion`: 輪郭が不規則に欠ける
- `crystallization`: 表面に白い結晶状のノイズ
- `withering`: 形が縮む、色が褪せる
- `dissolution`: 半透明になり、溶けるように消える

---

## 9. UI/UX仕様

### 9.1 画面遷移

```
[アプリ起動]
    ↓
[Tap to Start オーバーレイ]（AudioContext初期化）
    ↓
[Gallery（ホーム）]
    ├─ [Workshop] ←→ [Gallery]
    ├─ [Studio]   ←→ [Gallery]
    └─ [Settings]
```

ナビゲーション: 画面下部に4タブ（Gallery / Workshop / Studio / Settings）

### 9.2 Gallery（楽器回廊）

ホーム画面。コレクションの一覧と、楽器が持つ物語・歴史・儚さを表現する。

```
+------------------------------------------------------------------+
| Unknown Instruments                              [⚙ Settings]    |
+------------------------------------------------------------------+
|                                                                    |
|  [+ 新しい楽器を創る]                                             |
|                                                                    |
|  ── 生きている楽器 ──────────────────────                          |
|                                                                    |
|  ┌──────┐  ┌──────┐  ┌──────┐                                    |
|  │ SVG  │  │ SVG  │  │ SVG  │                                    |
|  │      │  │      │  │      │                                    |
|  ├──────┤  ├──────┤  ├──────┤                                    |
|  │Vrelith│  │Felthris│ │Khaom │                                   |
|  │██░░░░│  │████░░│  │█████░│  ← 寿命バー                       |
|  │Gen 1  │  │Gen 2  │  │Gen 1  │                                  |
|  └──────┘  └──────┘  └──────┘                                    |
|                                                                    |
|  ── 遺跡 ──────────────────────                                   |
|                                                                    |
|  ┌──────┐  ┌──────┐                                               |
|  │灰色SVG│  │灰色SVG│  ← グレースケール・ひび割れ                  |
|  │(残骸) │  │(残骸) │                                              |
|  ├──────┤  ├──────┤                                               |
|  │Olm'th │  │Drenis │                                              |
|  │ 享年42│  │ 享年67│  ← 総演奏回数                                |
|  └──────┘  └──────┘                                               |
|                                                                    |
|  [系譜樹を見る]                                                    |
|                                                                    |
+------------------------------------------------------------------+
| [Gallery]  [Workshop]  [Studio]  [Settings]                       |
+------------------------------------------------------------------+
```

タイル要素:
- SVGサムネイル（Decay反映済み）
- 楽器名
- 寿命バー（残り%）
- 世代番号
- タップ → Workshop画面（その楽器の詳細・演奏）

系譜樹ビュー:
- ノード = 楽器のSVGサムネイル
- エッジ = 親子関係
- 交配 = 2本の線が合流
- 遺跡はグレーアウトされたノード

### 9.3 Workshop（楽器工房）

楽器の生成・閲覧・演奏を行う画面。

```
+------------------------------------------------------------------+
| ← Gallery            Workshop                                    |
+------------------------------------------------------------------+
|                                                                    |
|  ┌──────────────────────────────────────┐                         |
|  │                                      │                         |
|  │          楽器SVGビジュアル             │                         |
|  │          （大きく表示）                │                         |
|  │                                      │                         |
|  └──────────────────────────────────────┘                         |
|                                                                    |
|  Vrelith（ヴレリス）                         寿命: ████████░░ 78% |
|  古英語の'vreon'（震える）と...                                    |
|  「湿った玄武岩の薄板を鹿の腱で張った...」                         |
|  素材: 玄武岩, 鹿の腱, 黒檀                                       |
|                                                                    |
|  ── 演奏 ────────────────────                                     |
|                                                                    |
|  ┌──────────────────────────────────────┐                         |
|  │  [楽器固有の演奏UI]                    │                         |
|  │  （interaction.typeに応じたUI）         │                         |
|  │  例: スライド、鍵盤、タップパッド等     │                         |
|  └──────────────────────────────────────┘                         |
|  [🎹 鍵盤に切替] [🔊 試聴]                                        |
|                                                                    |
|  ── アクション ──────────────                                     |
|  [📸 スナップショット保存]  [🧬 世代交代]  [🔬 交配]              |
|  [⚙ パラメータ調整]  [📋 再生成]                                  |
|                                                                    |
+------------------------------------------------------------------+
```

演奏UIの切替:
- デフォルト: `interaction.type`に基づく固有UI
- 切替ボタンで標準鍵盤UIにフォールバック可能（作曲準備時に便利）
- どちらのUIも同じMIDIノートデータを出力

演奏UI仕様:

| type | 操作 | ノートマッピング |
|------|-----|---------------|
| `keys` | マウスクリック / タッチ。押下で発音、離すと消音 | 8鍵。baseFrequencyから半音階で配置。スケール制約あり |
| `slide` | 水平ドラッグ。位置でピッチ、速度で音量 | 連続的なピッチ。離散ノートにスナップ可能 |
| `tap` | 円形パッドをタップ。強さで音量 | 6-8パッド。各パッドに異なるノートを割当 |
| `drag` | SVG楽器上をドラッグ。位置でピッチと音色変化 | Y座標→ピッチ、X座標→フィルター開度 |
| `bow` | 長押し＋ゆっくりドラッグ。速度で音量 | ドラッグ距離→ピッチ変化。ゆっくり＝レガート |

スナップショット:
- 「📸」ボタンで現在のパラメータ状態を凍結保存
- スナップショット一覧から復元可能（復元 = そのパラメータで新しいシンセを構築。元のDecay状態には影響しない）
- 各スナップショットにラベルを付与可能

### 9.4 Studio（作曲スタジオ）

グリッドシーケンサーによる作曲画面。Beepbox/Chrome Music Lab Song Makerの設計思想を参照。

```
+------------------------------------------------------------------+
| ← Gallery            Studio: [曲名]                              |
+------------------------------------------------------------------+
| Scale: [Pentatonic▼]  Bars: [4▼]  BPM: [120 ◀━━━━━●━━▶]        |
| [▶ Play] [⏹ Stop] [🔁 Loop: ON]        [📥 Export WAV]          |
+--------+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+       |
| Notes  | 1        | 2        | 3        | 4        |  ← 拍      |
+--------+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+       |
|   E5   |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |       |
|   D5   |  |■ |  |  |  |  |  |  |  |■ |  |  |  |  |  |  |       |
|   C5   |■ |  |  |■ |  |  |  |  |■ |  |  |  |  |  |  |  |       |
|   B4   |  |  |  |  |  |  |■ |  |  |  |  |  |■ |  |  |  |       |
|   A4   |  |  |■ |  |■ |  |  |  |  |  |■ |  |  |■ |  |  |       |
|   G4   |  |  |  |  |  |■ |  |■ |  |  |  |■ |  |  |■ |  |       |
+--------+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+       |
| Track 1: Vrelith       [🔇][Solo] Vol: ━━━━━●━━                  |
| Track 2: Felthris      [🔇][Solo] Vol: ━━━━━━━●                  |
| Track 3: (empty)       [+ 楽器を選択]                              |
+------------------------------------------------------------------+
| [+ トラック追加]（最大8）                                          |
+------------------------------------------------------------------+
```

グリッド仕様:
- X軸: 時間。1小節 = `timeSignature[0]`拍。1拍 = 4セル（16分音符解像度）
- Y軸: ピッチ。選択中スケールに属するノートのみ表示
- セルクリック: トグル（ON/OFF）
- セルドラッグ: 連続してON（描画モード）
- 現在再生位置: 縦線が左→右にスクロール

トラック管理:
- 各トラックに1つの楽器を割当（Galleryから選択）
- ミュート / ソロ / 音量
- 最大8トラック
- トラック間でグリッドは独立（異なるノートパターン）

Decayとの関係:
- Studio内での再生はDecayカウントに含めない（作曲中に楽器が朽ちない）
- 楽曲Decayモードは別機能（セクション12.3参照）

### 9.5 Settings（設定）

```
── API設定 ──
Gemini APIキー: [••••••••••••]  [表示/非表示]

── 楽器設定 ──
Decay: [ON ◉ / ○ OFF]
時刻感応: [ON ◉ / ○ OFF]
デフォルトスケール: [Pentatonic Major ▼]

── データ管理 ──
[📤 コレクション全体をエクスポート（JSON）]
[📥 コレクションをインポート]
[🗑 全データを削除]

── 情報 ──
楽器数: 12（生存: 8, 遺跡: 4）
楽曲数: 3
ストレージ使用量: 2.4MB / 5MB
```

---

## 10. Decayシステム仕様

### 10.1 設計原則

リサーチの結論を踏まえた設計判断:
- Decayが快体験になる条件 = 「朽ちる対象が自由に再生成でき、希少な報酬でないとき」
- Decayが不快になる条件 = 「喪失が永続的かつ対象が苦労して得たものであるとき」
- 本プロダクトではAIで楽器を無限に再生成可能なため、前者の条件を満たす
- ただし、お気に入りの楽器が不意に壊れる不快を防ぐため、スナップショットとON/OFFを提供

### 10.2 劣化モデル

```typescript
function calculateDecayFactor(playCount: number, lifespan: number): number {
  // 0→1の進行度。緩→急の二次カーブ
  const p = Math.min(playCount / lifespan, 1.0);
  return p * p; // 0 → 0.01 → 0.04 → ... → 0.64 → 1.0
}

function applyDecay(
  originalParams: SynthParams & FilterParams,
  decayVectors: DecayVector[],
  decayFactor: number,
  seed: number
): SynthParams & FilterParams {
  const modified = deepClone(originalParams);
  const rng = seededRandom(seed);

  for (const vec of decayVectors) {
    const paramRef = getNestedParam(modified, vec.paramPath);
    const noise = (rng() - 0.5) * 0.2; // ±10%のランダムノイズ
    const shift = vec.direction * vec.weight * decayFactor * (1 + noise);
    setNestedParam(modified, vec.paramPath, paramRef + shift * paramRef);
  }

  // 全パラメータを有効範囲にクランプ
  return clampAllParams(modified);
}
```

### 10.3 劣化カーブの体感

| 演奏回数（lifespan=50の場合） | decayFactor | 体感 |
|-----|-------|------|
| 0-10 | 0 - 0.04 | ほぼ変化なし。安心して音を楽しめる |
| 10-25 | 0.04 - 0.25 | 微かな変化。「あれ、少し音が変わった？」 |
| 25-40 | 0.25 - 0.64 | 明確な劣化。元の音色からの逸脱が聴き取れる |
| 40-50 | 0.64 - 1.0 | 大きく崩壊。もはや別の音。SVGもひび割れだらけ |
| 50 | 1.0 | 死亡。音が出なくなる。「遺跡」化 |

### 10.4 ON/OFF制御

| コンテキスト | Decay適用 |
|------------|----------|
| Workshop演奏 | 設定に従う（ON/OFF） |
| Studio作曲中の再生 | 常にOFF |
| 楽曲Decayモード | 独立制御（セクション12.3） |

### 10.5 多様性確保

- 各楽器に固有の`seed`を付与し、同じdecayFacterでも異なるノイズパターンを生成
- `decayVectors`はAIが楽器ごとに設計（どのパラメータがどの方向に劣化するかが楽器依存）
- `decayCharacter`に応じてSVGの劣化パターンが異なる（5種類）
- 同じ`lifespan`でも、`weight`の分布が楽器ごとに異なるため、劣化の「個性」が生まれる

---

## 11. 作曲機能仕様

### 11.1 シーケンサーエンジン

Tone.js Transportベースで実装する。

```typescript
class SequencerEngine {
  private transport = Tone.getTransport();
  private parts: Map<string, Tone.Part> = new Map(); // trackId → Part

  play() {
    this.transport.start();
  }

  stop() {
    this.transport.stop();
    this.transport.position = 0;
  }

  setTempo(bpm: number) {
    this.transport.bpm.value = bpm;
  }

  // トラックのノートデータをTone.Partとしてスケジュール
  scheduleTrack(track: Track, synth: Tone.PolySynth) {
    const events = track.notes.map(note => ({
      time: `0:${note.startBeat}`,  // Tone.js Time記法に変換
      note: Tone.Frequency(note.pitch, 'midi').toNote(),
      duration: `0:${note.duration}`,
      velocity: note.velocity,
    }));

    const part = new Tone.Part((time, event) => {
      synth.triggerAttackRelease(
        event.note, event.duration, time, event.velocity
      );
    }, events);

    part.loop = true;
    part.loopEnd = this.calculateSongDuration();
    part.start(0);
    this.parts.set(track.id, part);
  }
}
```

### 11.2 スケール定義

```typescript
const SCALES: Record<ScaleType, number[]> = {
  chromatic:        [0,1,2,3,4,5,6,7,8,9,10,11],
  major:            [0,2,4,5,7,9,11],
  minor:            [0,2,3,5,7,8,10],
  pentatonic_major: [0,2,4,7,9],
  pentatonic_minor: [0,3,5,7,10],
  dorian:           [0,2,3,5,7,9,10],
  mixolydian:       [0,2,4,5,7,9,10],
  blues:            [0,3,5,6,7,10],
  whole_tone:       [0,2,4,6,8,10],
};

// グリッドに表示するノートを生成
function getGridNotes(scale: ScaleType, octaveRange: [number, number]): number[] {
  const intervals = SCALES[scale];
  const notes: number[] = [];
  for (let oct = octaveRange[0]; oct <= octaveRange[1]; oct++) {
    for (const interval of intervals) {
      notes.push(oct * 12 + interval);
    }
  }
  return notes.reverse(); // 高い音が上
}
```

デフォルトオクターブ範囲: [3, 5]（C3〜B5、音楽的に最も使いやすい帯域）

### 11.3 WAVエクスポート

```typescript
async function exportWav(song: Song, instruments: Map<string, InstrumentSynth>): Promise<Blob> {
  const duration = calculateSongDuration(song);

  const buffer = await Tone.Offline(({ transport }) => {
    transport.bpm.value = song.tempo;

    for (const track of song.tracks) {
      if (track.muted) continue;
      const synth = instruments.get(track.instrumentId);
      if (!synth) continue;

      // OfflineContext内でシンセとエフェクトを再構築
      const offlineSynth = createSynth(synth.params);
      const chain = buildEffectChain(synth.effects);
      offlineSynth.chain(...chain, Tone.getDestination());

      // ノートをスケジュール
      for (const note of track.notes) {
        const time = note.startBeat * (60 / song.tempo);
        const dur = note.duration * (60 / song.tempo);
        offlineSynth.triggerAttackRelease(
          Tone.Frequency(note.pitch, 'midi').toNote(),
          dur, time, note.velocity * track.volume
        );
      }
    }

    transport.start();
  }, duration);

  return audioBufferToWav(buffer);
}
```

---

## 12. 拡張機能仕様

### 12.1 楽器交配

2つの楽器を選択し、AIに交配プロンプト（セクション7.3）を送信して子楽器を生成する。

- Workshop画面の「🔬 交配」ボタンから、Galleryの楽器を2つ選択
- 子楽器の`lineage.crossbreedParentIds`に両親IDを記録
- 子楽器は両親とは独立した新しいDecay状態を持つ
- 系譜樹では交配は2本の線が合流するノードとして表示

### 12.2 時刻感応

ブラウザのDate APIを使い、演奏時の時刻に応じてパラメータを微調整する。

```typescript
function applyTimeSensitivity(params: SynthParams, filter: FilterParams): {
  synth: SynthParams; filter: FilterParams
} {
  const hour = new Date().getHours();
  const modified = { synth: deepClone(params), filter: deepClone(filter) };

  if (hour >= 0 && hour < 5) {
    // 深夜: 倍音豊か、残響深い、暗い
    modified.synth.harmonicity = (modified.synth.harmonicity ?? 3) * 1.3;
    modified.filter.frequency *= 0.7;
  } else if (hour >= 5 && hour < 8) {
    // 早朝: 高域クリア、アタック鋭い
    modified.filter.frequency *= 1.4;
    modified.synth.attack *= 0.6;
  } else if (hour >= 8 && hour < 12) {
    // 午前: バランス良い（変化なし）
  } else if (hour >= 12 && hour < 17) {
    // 午後: やや明るく、サスティン長め
    modified.synth.sustain = Math.min(modified.synth.sustain * 1.2, 1.0);
  } else if (hour >= 17 && hour < 21) {
    // 夕方: 温かみ増加、中域強調
    modified.filter.frequency *= 0.85;
    modified.filter.q *= 1.3;
  } else {
    // 夜: リリース長い、リバーブ的な広がり
    modified.synth.release *= 1.5;
  }

  return modified;
}
```

ON/OFFは設定画面で切替。Studio作曲中は常にOFF。

### 12.3 楽曲Decayモード

保存した楽曲が現実世界の経過時間に応じて変質する。

- Song画面で「楽曲Decay: ON」を有効にすると、`decayStartedAt`に現在時刻が記録される
- 再生時、経過日数 × `decayRatePerDay`で各トラックの楽器パラメータに劣化を適用
- 劣化は楽器本体のDecayとは独立（楽器自体が生きていても、曲の中での音は経年変化する）
- 楽曲のSVG表記にも劣化が反映される（ジャケットアート的に）

### 12.4 世代交代（音の伝言）

楽器が朽ちる前に「遺言」を残し、次世代の楽器を生む。

1. Workshop画面で寿命が50%以下になると「🧬 世代交代」ボタンが活性化
2. ボタン押下 → 逆生成プロンプト（セクション7.2）でテキストを生成
3. 生成されたテキストを楽器生成プロンプトに投入し、子楽器を自動生成
4. 子楽器の`lineage.parentId`に親IDを、`lineage.generation`に親+1を設定
5. 系譜樹に新ノードが追加される

世代を重ねるほど、最初のテキストから離れた意外な楽器が生まれる。10世代後に系譜を振り返ると、言語と音の伝言ゲームの軌跡が見える。

---

## 13. データ永続化

### 13.1 ストレージ戦略

```typescript
interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any | null>;
  delete(key: string): Promise<void>;
  listKeys(prefix: string): Promise<string[]>;
}
```

- 楽器数 < 50, 楽曲数 < 20: localStorage（5MB上限）
- それ以上: IndexedDBにフォールバック（実質無制限）
- 判定: アプリ起動時にデータサイズをチェックし、自動切替

キー設計:
- `ui:instruments:{id}` → Instrumentオブジェクト
- `ui:songs:{id}` → Songオブジェクト
- `ui:settings` → AppSettingsオブジェクト
- `ui:meta` → メタ情報（楽器数、総サイズ等）

### 13.2 エクスポート/インポート

エクスポート:
- 全楽器 + 全楽曲 + 設定（APIキー除く）を1つのJSONファイルとしてダウンロード
- ファイル名: `unknown-instruments-backup-{YYYYMMDD}.json`

インポート:
- JSONファイルをアップロード → バリデーション → 既存データとマージ（IDで重複判定）

---

## 14. 制約事項と既知の限界

### 技術的制約

| 制約 | 影響 | 対策 |
|-----|------|-----|
| AIの「意味のギャップ」 | テキストから音色への変換精度に限界がある。「warm」「bright」等の形容詞は主観的で非定量的 | AI出力は「出発点」と位置づけ、手動調整パネルと再生成機能を提供 |
| Gemini APIのStructured Outputsでも意味論的な正しさは保証されない | 不正なパラメータ、範囲外の数値、意図とずれたJSONが返る可能性 | validator.tsで全フィールドを検証・クランプ。パース失敗時はリトライ |
| Gemini APIレート制限 | 無料枠ではRPM/TPM/RPDの上限に達する可能性 | レート制限管理（GeminiClient.tsに実装）。エラー時にユーザーに待機を通知 |
| モバイルSafariの音声制約 | AudioContextが44100Hzにロック、自動再生ブロックが厳格 | 「Tap to Start」オーバーレイ必須。モバイルでの動作はベストエフォート |
| AudioWorklet 128サンプル制約 | モバイルで音割れの可能性 | 初期実装では標準Web Audioノード（Tone.js経由）を使用。AudioWorkletは将来オプション |
| localStorage 5MB上限 | 大量の楽器・楽曲で溢れる | IndexedDBフォールバック |

### 設計上のトレードオフ

| トレードオフ | 判断 | 理由 |
|------------|------|------|
| Decay ON/OFFの提供 | ON/OFF提供する | コア哲学の力は弱まるが、作曲機能との矛盾を解消するため必須 |
| 鍵盤UIの固定提供 | 固有UIデフォルト + 鍵盤フォールバック | 固有UIの面白さと、作曲時の操作統一性を両立 |
| AI音質 vs 手動調整 | 両方提供 | AI出力に期待しすぎないが、手動調整の手間は最小限にする |
| Claude Artifact化 | 採用しない | API費用は避けられるが、localStorage/IndexedDBをwindow.storageへ置き換える必要があり、単一ファイル寄りの構成制約も大きいため |
| フルDAW vs 簡易シーケンサー | 簡易シーケンサー（Beepbox級） | 1人開発のスコープ制約。フルDAWは不可能 |

---

## 15. 実装時の注意事項

### Tone.js初期化

```typescript
// アプリ起動時、ユーザージェスチャー後に呼ぶ
async function initAudio() {
  await Tone.start();
  console.log('AudioContext started:', Tone.getContext().state);
}
```

### Gemini API呼び出し

```typescript
async function generateInstrument(userText: string, apiKey: string): Promise<AIResponse> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: buildPrompt(userText) }] }
      ],
      generationConfig: {
        responseFormat: {
          text: {
            mimeType: 'application/json',
            schema: INSTRUMENT_RESPONSE_SCHEMA,
          },
        },
      },
    }),
  });

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // JSONパース（Structured Outputs前提。念のためコードブロック除去も残す）
  const cleanJson = rawText.replace(/```json\s*|```\s*/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  return validateAndClamp(parsed);
}
```

### パフォーマンス考慮

- シンセインスタンスは楽器切替時に`.dispose()`で確実に解放
- グリッドシーケンサーの再描画はReact.memo + useMemoで最適化
- SVGのDecayオーバーレイはCSS transitionで滑らかに変化（JSアニメーションを避ける）
- 大量ノートのTone.Part登録はバッチ処理（1000ノート以上の場合）
