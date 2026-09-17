# OUTWIT DUEL

[![CI](https://github.com/tnakamura0/1v1-battle-game/actions/workflows/ci.yml/badge.svg)](https://github.com/tnakamura0/1v1-battle-game/actions/workflows/ci.yml)

チャージ・攻撃・ガードの3択で駆け引きする、CPU対戦の1対1バトルゲームです。

**▶ [1v1-battle-game-ecru.vercel.app](https://1v1-battle-game-ecru.vercel.app)** — 登録不要、ブラウザだけで遊べます。

<p align="center">
  <img src="./docs/images/home.png" alt="トップ画面。「読み合いの1対1バトル」の見出しと対戦を始めるボタン、その下に対戦画面のプレビュー" width="260" />
  <img src="./docs/images/preset.png" alt="対戦ルールの選択画面。「サクッと遊ぶ」「真剣勝負」「サドンデス」の3つのおすすめ設定" width="260" />
  <img src="./docs/images/battle.png" alt="対戦画面。両者のHPとエネルギー、ターン履歴、3つの行動ボタン" width="260" />
</p>

## 遊び方

毎ターン、お互いが3つの行動から1つを選び、**同時に公開されます**。相手のHPを0にすれば勝ちです。

**ダメージが発生するのは、片方が攻撃・もう片方がチャージのときだけです。**

| 自分 \ 相手 | チャージ | 攻撃 | ガード |
| --- | --- | --- | --- |
| **チャージ** | — | 自分に1 | — |
| **攻撃** | 相手に1 | —（相打ち） | —（ガードされる） |
| **ガード** | — | —（ガード成功） | — |

**無防備になるのはチャージのターンだけ**です。それでいて、攻撃に使うエネルギーの主な供給源もチャージなので、どこで溜めるかが読み合いになります。

エネルギーの増減や各行動の細かい条件は、[アプリ](https://1v1-battle-game-ecru.vercel.app)の「ルールを見る」から確認できます。

対戦前に初期HP（1〜3）・ガードのクールダウン（1〜3ターン）・CPUの強さ（ふつう / つよい）を選べます。「サクッと遊ぶ」「真剣勝負」「サドンデス」のおすすめ設定も用意しています。

## 技術スタック

- [Vite](https://vite.dev/) + [React](https://react.dev/) (SPA) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [react-router](https://reactrouter.com/)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- ESLint + Prettier
- Docker（開発環境）
- GitHub Actions（CI: lint / typecheck / test / build）
- Vercel（ホスティング）

バックエンドはなく、対戦のロジックはすべてブラウザ上で完結します。

## ライセンス

[MIT](./LICENSE)
