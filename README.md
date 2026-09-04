# react-template

Claude CodeでReactアプリを開発するためのテンプレートリポジトリ。

## 技術スタック

- [Vite](https://vite.dev/) + [React](https://react.dev/) (SPA) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [react-router](https://reactrouter.com/)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- ESLint + Prettier
- Docker（開発環境）
- GitHub Actions（CI: lint / typecheck / test / build）

## セットアップ

[Docker](https://www.docker.com/) がインストールされていれば、ホストにNode.jsを入れる必要はない。

```bash
docker compose up
```

`http://localhost:5173` で開発サーバーにアクセスできる。ソースコードの変更はホットリロードされる。

lint・typecheck・test・buildなどその他のコマンドは、コンテナ内で実行する（詳細は [CLAUDE.md](./CLAUDE.md) を参照）。

```bash
docker compose run --rm app npm run lint
docker compose run --rm app npm run typecheck
docker compose run --rm app npm run test:run
docker compose run --rm app npm run build
```

## 開発フロー・Issue/PR運用

Git Flowベースのブランチ戦略、Issue/PRテンプレート、Claude Code向けskills（`/new-issue-bug` など）を導入済み。詳細は [docs/development-flow.md](./docs/development-flow.md) を参照。

コーディング規約（ディレクトリ構成・スタイリング・テストの方針）は [docs/coding-conventions.md](./docs/coding-conventions.md) を参照。
