# PUBLISHING

公開する前に見ることと、リポジトリの説明文・トピックの案です。

## GitHub の説明文（案）

> Seven case studies, in Japanese, from full-stack work on a multi-tenant B2B SaaS: platform
> integration, test automation and quality gates, CI and developer experience, an unattended goal
> bus for AI agents, spec-driven development, and everyday AI use. Job figures and demo figures are
> kept apart.

日本語で出す場合の案です。

> マルチテナント B2B SaaS でのフルスタック開発の事例集（7 本）。基盤統合、テスト自動化と品質ゲート、
> CI と開発体験、AI エージェントの無人運用、仕様駆動開発、日々の AI 活用。実務の数字とデモの数字は分けて
> 書いています。

## トピック（案）

`case-study` `software-engineering` `ai-agents` `claude-code` `spec-driven-development`
`test-automation` `quality-gate` `ci-cd` `developer-experience` `oauth2` `multi-tenant` `japanese`

## 公開前のチェックリスト

### 1. 漏れていないか

- [ ] 社名・製品名・社内の基盤の名前・チーム名・人名・チケット番号・内部の URL やホスト名が、どの事例にも
      ないこと。README 末尾の署名行だけが例外です。
- [ ] 実務の数字のある表に、すべて「実務での実測値（コードは非公開）」と書いてあること。
- [ ] デモの数字が、各事例の「関連リポジトリ」の節にだけあること。
- [ ] 製品の不具合の内容や件数、セキュリティ上の問題、顧客への影響が書かれていないこと。

### 2. リンクが生きているか

- [ ] `node tools/check.ts` が `0 problems` で終わること。
- [ ] 各事例から張っているリポジトリが、すべて公開されていること。
- [ ] 06 と 07 の「公開準備中」を、関連リポジトリを公開した後にリンクへ置き換えること。

### 3. 表示

- [ ] GitHub 上で、01〜06 の Mermaid の図がそれぞれ図として表示されること。
- [ ] CI（`.github/workflows/ci.yml`）を一度動かし、緑になること。
