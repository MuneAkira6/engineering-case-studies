# engineering-case-studies

> **English summary** — Seven case studies, written in Japanese, from my full-stack work on a
> multi-tenant B2B SaaS (Scala / Play + React): integrating a group-wide account and tenant platform,
> test automation and quality gates, CI and developer experience, an unattended long-lived "goal bus"
> for AI agents, spec-driven development with spec-kit, everyday AI use, and three smaller pieces.
> Every figure from the job is marked as such and kept apart from the figures measured in the public
> demo repositories that rebuild the same ideas.

## 何を示すか

現職のマルチテナント B2B SaaS（Scala / Play + React）で取り組んだことを、7 本の事例にまとめました。
どの事例も、何が課題で、なぜそう判断し、どう確かめたかを中心に書いています。

| # | 事例 | 主な内容 | 関連リポジトリ |
|---|---|---|---|
| 01 | [グループ共通のアカウント・テナント基盤との統合](01-platform-integration.md) | 認可コード + PKCE、Bearer の受理、ロールの導出、Webhook、テナント同期 | [idp-tenant-integration-demo](https://github.com/MuneAkira6/idp-tenant-integration-demo) |
| 02 | [テスト自動化と品質ゲート](02-test-automation-and-quality-gates.md) | 仕様書を分母にしたカバレッジ台帳、失敗を四つに分ける品質ゲート | [regression-gate-demo](https://github.com/MuneAkira6/regression-gate-demo) |
| 03 | [CI と開発体験](03-ci-and-developer-experience.md) | self-hosted runner の PR コンパイルチェック、非決定的な失敗の切り分け、devcontainer、OSS ライセンス一覧 | [ci-devex-toolkit](https://github.com/MuneAkira6/ci-devex-toolkit) |
| 04 | [無人で goal を回す：長命バス方式の設計と教訓](04-unattended-goal-bus.md) | AI エージェントの長い作業を、人が張り付かずに進める方式 | [goal-bus-kit](https://github.com/MuneAkira6/goal-bus-kit) |
| 05 | [仕様駆動開発（SDD）の実践](05-spec-driven-development.md) | spec-kit の調整、判定の語彙、実測優先、契約の凍結 | [spec-driven-dev-playbook](https://github.com/MuneAkira6/spec-driven-dev-playbook) |
| 06 | [日々の開発での AI 活用](06-ai-in-daily-engineering.md) | スキルと評価、朝会ダイジェスト、ローカル LLM、チームへの展開 | 公開準備中 |
| 07 | [その他の成果](07-other-work.md) | N+1 の解消、スレッド枯渇によるデッドロック、ビルドツールの移行 | 公開準備中 |

01〜06 は 2,000〜4,000 字程度、07 は小さな 3 件をまとめた短い事例です。

## 背景

- 筆者は 2025 年 10 月から、マルチテナント B2B SaaS の開発でフルスタックを担当しています。フロントエンドは
  React / TypeScript、バックエンドは Scala / Play / Akka と MongoDB です。テスト自動化と CI も受け持っています。
- 実装の大部分は AI エージェント（Claude Code）が担い、筆者は設計・裁定・検収を担っています。事例の中でも、
  エージェントに任せたことと人が決めたことを分けて書いています。
- 製品名・会社名・チーム名・人名・チケット番号は書いていません。グループ共通の基盤は「グループ共通の
  アカウント・テナント基盤」、それを開発するチームは「基盤チーム」と呼んでいます。

## 設計

- **事例の構成。** 概要（3 行）→ 背景 → 課題 → 原因の分析 → 対策 → 検証 → 結果 → 学び → 関連リポジトリ、の順です。
  07 だけは、小さな 3 件をまとめた短い構成にしています。
- **二種類の数字を混ぜない。** 実務の数字には「実務での実測値（コードは非公開）」と書き、日付・環境・回数などの
  条件を添えています。デモの数字は、各事例の「関連リポジトリ」の節に分けて載せています。デモの数字は、
  公開リポジトリで実際に走らせた結果だけで、測った機械の構成も書いています。
- **形容詞で語らない。** 「劇的に」のような言葉は使わず、数字と条件で書いています。
- **書かないこと。** 製品の不具合の内容や件数、セキュリティ上の問題、顧客への影響は書いていません。品質に関わる
  話題は、方法と仕組みだけを書いています。
- **図。** Mermaid で書いています。GitHub 上ではそのまま図として表示されます。

## 動かし方

読むだけなら、上の表から各事例を開いてください。リンクと用語の検査は次の 1 行です（Node 24 以上、依存なし）。

```bash
node tools/check.ts
```

相対リンクの行き先がすべて存在すること、日本語の文章に中国語の字体や語彙が混ざっていないことを確かめます
（筆者は中国語が第一言語なので、自分の日本語に混ざりやすいものを機械で拾っています）。CI でも同じ 1 行を
走らせます。

## 結果

各事例の主な数字です。どれも実務での実測値（コードは非公開）で、条件は各事例の表にあります。

| 事例 | 主な数字 |
|---|---|
| 01 | マージ済み PR 18 件。共有ステージングの判定 81 項目で 74 PASS・0 FAIL（残る 7 項目は人手の確認項目） |
| 02 | UI カバレッジ 22.1% → 83.9%（分母は機能仕様書から作った 523 行、既存の QA 資産を含む）。API 回帰 211 エンドポイント |
| 03 | PR コンパイルチェック約 3 分、Actions の課金枠の使用なし。ローカルの起動待ちを約 2 分 30 秒短縮 |
| 04 | 運用 18 回。最初の本番運用で 6 goal・裁決 9 回（うち REJECT 3 回）・判定 100 行で FAIL 0 |
| 05 | 仕様フォルダ 46 件。clarify を実施したフォルダは、初期の 32 件中 4 件から直近の 14 件中 12 件へ |
| 06 | 評価付きのスキル 7 個。朝会ダイジェストの消費は 1 日約 7k トークン |
| 07 | レポートの DB リクエストを 1 回のエクスポートあたり 2,055 回 → 16 回（1,000 人規模の合成データ、出力の CSV はバイト一致） |

`node tools/check.ts` の結果（2026-10-05、Windows 11・Node v24.15.0）：

```
check: 28 links in 9 files, 0 problems
```

## 制約・既知の限界

- 実務のコードと資料は公開できません。実務の数字は、読者が再現できるものではありません。その代わりに、同じ
  考え方を小さく作り直したデモのリポジトリを用意しています。
- 計測が 1 回だけのものがあります（スキルの評価は各腕 1 回、移行後のビルド時間は開発者端末で 1 回など）。
  該当する表には、そのことを書いています。
- 実務の数字は、記録を取った日のものです（たとえば判断の台帳 143 件は 2026-09-29 時点）。その後の作業で
  増えているものもあります。
- 事例 06 と 07 の関連リポジトリは公開の準備中です。
- 固有名詞を伏せているため、文脈が追いにくいところがあります。

## 作り方

- 下書きは AI エージェント（Claude Code）が書きました。材料は筆者の実務の記録（仕様、判定表、台帳、運用の
  ログ）で、エージェントはそれを読むだけにとどめ、公開用に一から書き直しています。原文の文章もコードも
  写していません。
- 数字は、社内の出典（非公開）と一件ずつ照合しました。出典が見つからない数字は、削るか、出典のある数字に
  置き換えています。
- 公開の前に、社名・製品名・人名・チケット番号・内部のホスト名などが含まれていないことを、機械的な走査で
  確かめています。

設計・レビュー・検証：So Ryo ／ 実装：AI エージェント（Claude Code）との協働
