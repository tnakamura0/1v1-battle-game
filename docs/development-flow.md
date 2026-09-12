# 開発フロー

## ブランチ戦略（Git Flow）

- `main`：本番環境にデプロイされているブランチ。直接pushは禁止、`release/*`または緊急修正の`fix/*`からのPRのみ受け付ける。
- `develop`：開発中の変更を集約する統合ブランチ。通常の作業はここから分岐し、ここにマージする。
- 作業ブランチ（`feat/*`, `fix/*`, `chore/*`, `refactor/*`, `docs/*`, `test/*`, `style/*`, `perf/*`）：`develop`から分岐し、`develop`へPRでマージする。
- `release/*`：リリース準備用ブランチ。`develop`から分岐し、`main`へPRでマージする。

## ブランチ命名規則

```
<type>/<issue番号>-<短い説明（英語・ハイフン区切り）>
```

`type`はConventional Commitsに準拠：`feat` / `fix` / `chore` / `refactor` / `docs` / `test` / `style` / `perf`

例：
- `feat/123-add-login-button`
- `fix/456-fix-null-pointer-on-logout`

リリースブランチのみ例外で `release/vX.Y.Z` の形式とする（例: `release/v1.2.0`）。

## コミットメッセージ規約（Conventional Commits）

```
<type>(<scope>): <概要>
```

例：`feat: ログイン画面にパスワード表示切り替えを追加`

`scope`は省略可。破壊的変更を含む場合は `<type>!: <概要>` のように `!` を付ける。

## Issue運用

Issueを作成する際は、必ず以下のいずれかのテンプレートを使用する。

- バグ報告：`.github/ISSUE_TEMPLATE/bug_report.md`（Claude Codeでは `/new-issue-bug` スキル）
- 機能要望：`.github/ISSUE_TEMPLATE/feature_request.md`（Claude Codeでは `/new-issue-feature` スキル）

## PR運用

- 作業ブランチから`develop`へのPRは、**小さな修正であっても必ずPR経由**とする（`develop`への直接pushは禁止）。
- PRテンプレート：`.github/pull_request_template.md`（Claude Codeでは `/new-pr` スキル）
- PRタイトルはConventional Commits形式に沿う（Squash merge時のコミットメッセージになるため）。
- **レビュー中・オープン中のPRに、後から別の変更を足さない**。別Issue・別PRに分ける。Squash mergeではPRタイトルだけがコミットの1行目になり、CHANGELOGは`git cliff`がその1行目から生成するため、**後から足した変更はCHANGELOGに残らない**。squashコミットの本文には各コミットのメッセージが入っているが、それは拾われない（v0.14.0で実際に漏れた）。CHANGELOGは毎回ファイル全体が再生成されるので、手で追記しても次のリリースで消える。
  - 新規ファイルへの依存があって`develop`から分岐できないときは、**元のPRを先にマージしてから**別ブランチで着手する。同じPRに足してよい、という意味ではない。
- レビュー：個人開発のため必須Approve人数は設定しない。ただし`.claude/hooks/`のフックによるテンプレート・命名規則の機械チェックをレビューの代替ゲートとする。
- マージ方法：**Squash merge**

## リリースフロー

バージョニングには [git-cliff](https://git-cliff.org/) を使用する（Conventional Commitsからバージョン計算・CHANGELOG生成を自動化するRust製ツール。言語・スタックに依存しない）。

リリースのタイミングは**機能完成ベース**とする。目安として、GitHub Milestoneに紐づけたIssue群がすべてクローズしたタイミングでリリース準備に入る。

1. `develop`から`release/vX.Y.Z`ブランチを作成する
   - バージョン番号は `git cliff --bumped-version` で自動計算する
2. CHANGELOGを生成する
   ```bash
   git cliff --bump -o CHANGELOG.md
   ```
   生成結果に**今回リリースする変更がすべて載っているか目視で確認する**。1PRに複数の変更をまとめてしまった場合、PRタイトル以外はここに現れない（「PR運用」を参照）。
3. `CHANGELOG.md`の変更をコミットする（`chore: update changelog for vX.Y.Z`）
4. `release/vX.Y.Z` → `main` のPRを作成し、**Merge commit**でマージする
5. マージ後、`main`上でタグを打つ
   ```bash
   git checkout main
   git pull
   git tag $(git cliff --bumped-version)
   git push --tags
   ```
6. `main`の変更を`develop`にマージし直す（バージョン情報・CHANGELOGの同期）
   ```bash
   git checkout develop
   git merge main
   git push
   ```

このベーステンプレートにCI/CD連携は含めない。技術スタック別のテンプレートリポジトリ側で、必要に応じてCI上でのテスト・lint実行やリリース自動化を追加すること。

## 緊急修正（hotfix代替）フロー

専用の`hotfix`ブランチ種別は設けない。本番で緊急の不具合が発生した場合は、通常の`fix/*`ブランチを**`develop`ではなく`main`から**直接作成し、以下の手順で対応する。

1. `main`から `fix/<issue番号>-<説明>` ブランチを作成
2. 修正後、`main`へPRを作成しSquash mergeでマージ
3. 同じ修正を`develop`にも反映する（`git cherry-pick`、または同ブランチから`develop`へも別途PRを作成）

## 関連ファイル

| ファイル | 役割 |
|---|---|
| `.github/pull_request_template.md` | PRテンプレート |
| `.github/ISSUE_TEMPLATE/bug_report.md` | バグ報告Issueテンプレート |
| `.github/ISSUE_TEMPLATE/feature_request.md` | 機能要望Issueテンプレート |
| `.claude/settings.json` | permissions・hooksの設定 |
| `.claude/hooks/check-branch-name.sh` | ブランチ命名規約の機械チェック |
| `.claude/hooks/check-pr-template.sh` | PRタイトル・本文の機械チェック |
| `.claude/agents/code-reviewer.md` | PR作成前のセルフレビュー用サブエージェント |
| `.claude/skills/new-pr/SKILL.md` | `/new-pr` スキル |
| `.claude/skills/new-issue-bug/SKILL.md` | `/new-issue-bug` スキル |
| `.claude/skills/new-issue-feature/SKILL.md` | `/new-issue-feature` スキル |
