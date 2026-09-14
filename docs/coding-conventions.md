# コーディング規約

## ディレクトリ構成

```
src/
  pages/      # ルート単位の画面コンポーネント（react-routerの各Routeに対応）
  routes/     # ルーティング定義（AppRoutes）
  components/ # 複数の画面から再利用するコンポーネント
  test/       # テストのセットアップなど横断的な設定
```

- ページ固有でしか使わないコンポーネントは、まず該当する `pages/` 配下に置く。2箇所以上から使うようになった時点で `components/` へ切り出す。
- コンポーネント間の import は `@/` エイリアス（`src/` を指す）を使う。相対パスの `../../` は避ける。

## スタイリング

- Tailwind CSSのユーティリティクラスを基本とする。独自CSSファイルは追加しない。
- 条件分岐が多くクラス名が読みにくくなる場合のみ、コンポーネント内でクラス名を変数に分けて整理する。
- **フォントサイズは `src/index.css` に定義した「はしご」に従う。** 10px は `text-chip`、11px は `text-meta`、12px以上はTailwind既定のユーティリティ（`text-xs` / `text-sm` / `text-base` / …）。`text-[9px]` のような任意値はESLint（`no-restricted-syntax`）で止めている。段の間が必要なら、まず `index.css` のはしごに段を足して名前を付けること。
- **全要素に一律で効かせたい見た目は、個々のコンポーネントではなく `src/index.css` に書く。** 個別に書くと新しい要素を足すたびに付け忘れ、画面ごとに挙動がばらつく。
  - 例：`button` の `cursor: pointer`。Tailwind v4 の preflight はこれを当てないので `index.css` の `@layer base` で一度だけ当てている。**個々のボタンに `cursor-pointer` を書かないこと。**
  - 一括では当てられない例外（`button` ではない操作要素など）は、なぜ例外なのかをコメントに残す。

## テスト

- テストファイルはテスト対象と同じディレクトリに `<対象ファイル名>.test.tsx` として置く（例: `src/pages/Home.tsx` → `src/pages/Home.test.tsx`）。
- Testing Libraryの方針に従い、DOM構造ではなくユーザーが見る内容（role・テキスト）を基準にクエリする。

## 開発コマンドの実行

このテンプレートはDockerを前提としており、`npm` コマンドはホストではなくコンテナ内で実行する。詳細はルートの `CLAUDE.md` / `README.md` を参照。
