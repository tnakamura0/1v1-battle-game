## [0.25.0] - 2026-09-24

### 🚀 Features

- ルール設定画面の補足文を見直す（冗長な一文を削除し、注記は展開後も表示） (#171)
## [0.24.1] - 2026-09-24

### 🐛 Bug Fixes

- PCで横並びのCTA 2つを親の幅いっぱいに広げる (#166)
- ルール設定画面の見出しのサイズを他画面に揃える (#168)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.24.1
## [0.24.0] - 2026-09-23

### 🚀 Features

- 結果画面の冒頭に勝敗の幕演出を追加 (#163)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.24.0
## [0.23.3] - 2026-09-21

### 🐛 Bug Fixes

- 枠線だけのCTAボタンのホバー挙動を3箇所で揃える (#158)

### 🚜 Refactor

- CTAボタンのクラスを ctaStyle.ts に統一する (#160)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.23.3
## [0.23.2] - 2026-09-18

### 🐛 Bug Fixes

- トップ以外のURLを直接開くと404になる不具合を修正 (#153)
- 存在しないパスにNotFound画面を表示する (#155)

### 📚 Documentation

- READMEをユーザー向けの内容に見直す (#152)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.23.2
## [0.23.1] - 2026-09-17

### 📚 Documentation

- READMEをです・ます調にし、画像をモバイル版3枚に差し替える (#148)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.23.1
## [0.23.0] - 2026-09-17

### 🚀 Features

- OGP画像とメタタグを追加する (#145)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.23.0
## [0.22.1] - 2026-09-16

### 📚 Documentation

- READMEを公開用に書き直す (#142)

### ⚙️ Miscellaneous Tasks

- 公開前の下準備としてLICENSEと設定ファイルを整える (#140)
- Update changelog for v0.22.1
## [0.22.0] - 2026-09-16

### 🚀 Features

- つよいCPUの評価に次ターンの選択肢の数を加える (#136)
- エネルギー最大時のチャージを非合法にする (#137)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.22.0
## [0.21.0] - 2026-09-16

### 🚀 Features

- 対戦ルール選択画面の個別設定を折りたたむ (#130)
- 結果画面と共有テキストに対戦ルールを出す (#132)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.21.0
## [0.20.0] - 2026-09-15

### 🚀 Features

- 対戦開始前のカウントダウンを画面内の要素の先頭に移す (#125)
- 結果フェーズの公開された手を円にする (#127)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.20.0
## [0.19.0] - 2026-09-14

### 🚀 Features

- 結果画面の残り時間バーを滑らかに減らす (#110)
- 結果画面のカウントダウンを画面上に移す (#112)
- 結果フェーズの空きを行動カードに吸収させる (#119)
- フォントサイズのはしごを定義し、対戦画面の小さすぎる文字を底上げする (#121)

### 🐛 Bug Fixes

- LPの対戦UIプレビューが対戦画面と並びが食い違う問題を枠の共有で直す (#122)

### 🚜 Refactor

- 対戦画面の枠を両フェーズ共通のコンポーネントに切り出す (#114)
- 対戦画面の上ブロックをメタ情報→盤面の順に並べ替える (#116)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.19.0
## [0.18.0] - 2026-09-13

### 🚀 Features

- 対戦画面の画面切り替えにゲーム風のアニメーションを加える (#107)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.18.0
## [0.17.0] - 2026-09-13

### 🚀 Features

- 行動ボタンをチャージを頂点とする三角形に配置する (#104)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.17.0
## [0.16.0] - 2026-09-12

### 🚀 Features

- ルール設定画面の見出し表現・ホバー・PCレイアウトを改善 (#97)
- ダメージとエネルギーの色を行動色から独立したトークンに切り出す (#101)

### 🐛 Bug Fixes

- サドンデスの danger を枠線から外し、枠線を選択状態専用にする (#99)
- ボタンに cursor: pointer を当てる規則を index.css に一本化する (#100)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.16.0
## [0.15.0] - 2026-09-12

### 🚀 Features

- おすすめ設定にサドンデスを追加し、設定画面のデザインを刷新する (#93)

### 📚 Documentation

- 後から足す変更を別PRに分けるルールをPR運用に追記する (#91)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.15.0
## [0.14.0] - 2026-09-11

### 🚀 Features

- 対戦画面の選択フェーズに対峙を示すVSアリーナを置く (#88)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.14.0
## [0.13.0] - 2026-09-11

### 🚀 Features

- PCサイズで対戦・設定・ルール画面が画面幅を活かすようにする (#85)

### 🐛 Bug Fixes

- LPプレビューの自分のステータスと行動ボタンの上下を対戦画面に揃える (#83)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.13.0
## [0.12.2] - 2026-09-10

### 🚜 Refactor

- ActionButtonをcomponents配下へ移動する (#78)
- 行動色のクラスマップをactionStyleに集約する (#79)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.12.2
## [0.12.1] - 2026-09-10

### 🐛 Bug Fixes

- モバイルで「相手を読む」セクションだけ左寄せになるのを直す (#76)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.12.1
## [0.12.0] - 2026-09-10

### 🚀 Features

- LPに行動色とアイコンを導入しデザインに合わせて再構成する (#71)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.12.0
## [0.11.0] - 2026-09-09

### 🚀 Features

- 対戦ルール選択画面を2つのセクションに分ける (#68)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.11.0
## [0.10.0] - 2026-09-09

### 🚀 Features

- ルール画面の行動の組み合わせを1つの表に統合する (#65)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.10.0
## [0.9.0] - 2026-09-09

### 🚀 Features

- 自分/相手の色分けを文字から領域へ移し対戦開始画面にも適用する (#62)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.9.0
## [0.8.0] - 2026-09-08

### 🚀 Features

- ルール設定画面におすすめ設定を追加し「プリセットから」表記を削除する (#55)
- 対戦画面で自分と相手を色分けする (#59)

### 🐛 Bug Fixes

- 画面遷移時にスクロール位置を先頭へ戻す (#57)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.8.0
## [0.7.1] - 2026-09-07

### 🐛 Bug Fixes

- 「つよい」CPUの思考ロジックを期待値ベースに作り直す (#52)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.7.1
## [0.7.0] - 2026-09-07

### 🚀 Features

- PC対戦画面のレイアウトをモバイルと統一 (#46)
- 対戦結果画面にX共有ボタンを追加 (#47)
- CPUの強さを選べるようにする（「ふつう」「つよい」） (#49)

### 🐛 Bug Fixes

- モバイルでルール選択画面のボタンがアドレスバーと被る問題を修正 (#44)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.7.0
## [0.6.0] - 2026-09-07

### 🚀 Features

- ガード成功時のエネルギー付与ルールを追加しルール画面を整理、アプリ名をOUTWIT DUELに変更 (#40)

### 🐛 Bug Fixes

- モバイルでターン結果画面のカウントダウンが画面外に見切れる問題を修正 (#38)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.6.0
## [0.5.1] - 2026-09-06

### 🐛 Bug Fixes

- モバイルでターン結果のステータス変化表が見切れる不具合を修正 (#35)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.5.1
## [0.5.0] - 2026-09-06

### 🚀 Features

- 攻撃アイコンをチャージ/ガードに合わせてOutline化 (#32)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.5.0
## [0.4.0] - 2026-09-06

### 🚀 Features

- LP/ルール画面の見出しデザイン・コンテンツ・アクセントカラーを改善 (#29)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.4.0
## [0.3.0] - 2026-09-06

### 🚀 Features

- LPのロゴ拡大・ルール導線とルール画面の見出し/アイコン/強調表示を改善 (#26)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.3.0
## [0.2.0] - 2026-09-06

### 🚀 Features

- 攻撃アイコンを剣の形状に更新しアプリロゴ「POCKET DUEL」とfaviconを導入 (#23)

### 🐛 Bug Fixes

- LP/ルール画面の文言とデフォルトプリセットを実プレイフィードバックに基づき修正 (#21)

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.2.0
## [0.1.0] - 2026-09-05

### 🚀 Features

- Tailwind v4 デザイントークンとフォント基盤を追加
- 対戦ルール判定・CPU思考・状態管理ロジックを追加
- HP/エネルギー/ガード表示の共通コンポーネントを追加
- LP（トップページ）を実装
- ルール/遊び方画面を追加
- 対戦ルール選択画面を追加
- 対戦画面（開始・手の選択・結果表示）を実装
- 対戦結果画面を追加
- 実プレイフィードバックに基づくUI/UX改善

### ⚙️ Miscellaneous Tasks

- Update changelog for v0.1.0
