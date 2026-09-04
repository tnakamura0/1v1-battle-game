## 開発フロー
@docs/development-flow.md

## コーディング規約
@docs/coding-conventions.md

## 技術スタック

Vite / React / TypeScript / Tailwind CSS / react-router / Vitest + Testing Library / ESLint + Prettier

## 開発コマンド

このテンプレートはDockerを前提とする。ホストにNode.js/npmをインストールする必要はなく、`npm` コマンドは常にDocker経由で実行すること。

```bash
# 開発サーバー起動（http://localhost:5173）
docker compose up

# lint / format / typecheck / test / build（コンテナ内で実行）
docker compose run --rm app npm run lint
docker compose run --rm app npm run lint:fix
docker compose run --rm app npm run format
docker compose run --rm app npm run typecheck
docker compose run --rm app npm run test:run
docker compose run --rm app npm run build

# 依存パッケージを追加した場合
docker compose run --rm app npm install <package-name>
```

Issue・PRを作成する際は、必ず以下のスキルを使用すること。素の `gh issue create` / `gh pr create` を直接叩かないこと。

- バグ報告Issue: `/new-issue-bug <概要>`
- 機能要望Issue: `/new-issue-feature <概要>`
- PR作成: `/new-pr`

これらは `.claude/skills/` 配下に定義されたスキルで、descriptionを見て必要に応じてClaudeが自律的に呼び出すこともできる。テンプレートが埋め込まれており、`.claude/hooks/` 配下のフックがタイトル・本文の規約違反（Conventional Commits形式、必須セクション、`Closes #`、ブランチ命名規則）を検知した場合、実行がブロックされる。
