# Unknown Instruments

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tone.js](https://img.shields.io/badge/Tone.js-Web_Audio-purple)
![Vite](https://img.shields.io/badge/Vite-7-yellow?logo=vite)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

> テキストで「架空の音」を書くと、AIが存在しない楽器を生成してブラウザ上で演奏・作曲できる

「霧の中の弦」「錆びた金属が共鳴する音」など、存在しない楽器のイメージをテキストで入力すると、AIが外観・音・名前を生成します。演奏を重ねると楽器が劣化し、やがて廃墟になる「寿命」システムが特徴です。アカウント不要・サーバー不要でブラウザだけで完結します。

---

## 主な機能

- テキスト入力からGemini AIが架空の楽器（名前・由来・外観SVGと音）を生成できる
- キー・スライド・タップ・ドラッグ・ボウの5つの演奏モードで楽器を演奏できる
- 演奏回数に応じて外観が酸化・侵食・結晶化などに変化する寿命・劣化システムを体験できる
- 複数楽器を掛け合わせた「子孫楽器」を生成できる
- マルチトラックのステップシーケンサー（作曲ツール）で楽曲を制作できる
- 楽曲をWAVファイルとして、コレクションをJSONファイルとしてエクスポートできる

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | React 19, TypeScript, Vite 7, Tone.js, Zustand, 手続き的SVG |
| データ永続化 | localStorage + IndexedDB |
| AI | Gemini API (`gemini-2.5-flash`), オフラインフォールバック |

---

## 設計の工夫

- すべての処理をブラウザ内で完結させるローカルファースト設計で、サーバーもデータベースも不要
- Gemini APIなしでも動作するフォールバック生成機能を用意し、APIキーをオプション扱いにすることで依存を排除
- 楽器ビジュアルをWebGLなしの手続き的SVGで生成し、ファイルサイズを最小化

---

## セットアップ

必要なツール：Node.js 20以上、pnpm

```bash
git clone https://github.com/snowtone-ai/Unknown-Instruments.git
cd Unknown-Instruments
pnpm install
pnpm dev
```

`http://127.0.0.1:5173` を開き、「Tap to Begin」→「Workshop」→ 音の説明を入力→「Generate」で動作確認できます。

Gemini APIキーを使う場合は `.env.local` を作成します（なくても動作します）。

```
VITE_GEMINI_API_KEY=your_key_here
VITE_GEMINI_MODEL=gemini-2.5-flash
```

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 本番ビルド |
| `pnpm typecheck` | 型チェック |
| `pnpm lint` | コード品質チェック |
| `pnpm test` | テスト実行 |
| `pnpm verify` | 全チェック一括実行 |

---

## ライセンス

MIT
