#!/usr/bin/env node
// check — the offline check of this repository's Markdown, run by CI and by hand: `node tools/check.ts`.
//
// Two checks over every *.md file, outside fenced code blocks and inline code:
//   1. Links. Every relative link target [text](target) must exist, resolved from the directory of
//      the file that holds it. A target with a scheme (https:, mailto:) is left alone, because the
//      check never goes online. A target with "#" is a problem in itself: an anchor cannot be
//      verified offline, so link the file.
//   2. Wording. The case studies are written in Japanese by someone whose first language is Chinese,
//      so Chinese character forms and Chinese words that read naturally to the author but not to a
//      Japanese reader are reported, with the Japanese to use instead. The lists are the ones of
//      tools/check-words.ts in spec-driven-dev-playbook, the other repository of this portfolio
//      that checks its Japanese prose.
//
// Prints one line per problem, then a summary; exits 1 when there is any problem.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKIPPED_DIRECTORIES = ['node_modules', '.git']
const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/

/** Simplified Chinese forms, which are not used when writing Japanese. */
const BANNED_CHARACTERS = (
  '总 线 实 验 确 认 执 复 账 闸 铸 审 决 过 这 们 说 时 间 问 题 发 现 结 进 为 对 应 该 务 设 计 划 ' +
  '页 档 录 选 择 仅 两 输 读 单 开 关 显 译 览 际 标 经 历 网 络 类 库'
).split(' ')

/** Chinese words, with the Japanese that says the same thing. */
const BANNED_WORDS: readonly [string, string][] = [
  ['提交', 'コミット（または提出）'],
  ['転正', '正式版への切り替え'],
  ['倉庫', 'リポジトリ'],
  ['夾具', 'フィクスチャ'],
  ['脚本', 'スクリプト'],
  ['運行', '実行'],
  ['文件', 'ファイル'],
  ['代碼', 'コード'],
  ['默認', '既定'],
  ['数据', 'データ'],
  ['數據', 'データ'],
  ['質量', '品質'],
  ['信息', '情報'],
  ['軟件', 'ソフトウェア'],
  ['部署', 'デプロイ（部門の意味なら「部門」）'],
  ['合併', 'マージ'],
  ['分支', 'ブランチ'],
  ['模板', 'テンプレート'],
  ['日誌', 'ログ'],
  ['接口', 'インターフェース'],
  ['参数', '引数（またはパラメータ）'],
  ['成本', 'コスト'],
  ['額度', '利用枠'],
  ['預計', '見込み'],
  ['清單', '一覧'],
  ['核収', '検収'],
  ['兜底', '最後の受け皿'],
  ['落盤', 'ファイルに書く'],
  ['視頻', '動画'],
  ['截圖', 'スクリーンショット'],
  ['緩存', 'キャッシュ'],
  ['用戸', 'ユーザー'],
  ['服務器', 'サーバー'],
  ['調試', 'デバッグ'],
  ['測試', 'テスト'],
  ['総線', 'バス'],
  ['票', 'チケット'],
]

/** Japanese compounds that contain a banned word and are correct as they are. */
const ALLOWED_COMPOUNDS = ['起票', '投票', '伝票']

type Problem = { file: string; line: number; message: string }

function markdownFiles(root: string): string[] {
  const found: string[] = []
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    )) {
      const full = join(directory, entry.name)
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.includes(entry.name)) walk(full)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        found.push(relative(root, full).split('\\').join('/'))
      }
    }
  }
  walk(root)
  return found
}

/** The lines outside fenced code blocks, 1-based, with inline code blanked out. */
function proseLines(text: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = []
  let fence = ''
  const lines = text.split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index]
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(raw)
    if (fence !== '') {
      if (marker !== null && marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = ''
      continue
    }
    if (marker !== null) {
      fence = marker[1]
      continue
    }
    out.push({ line: index + 1, text: raw.replace(/`[^`]*`/g, (code) => ' '.repeat(code.length)) })
  }
  return out
}

function linkProblems(root: string, file: string, line: number, text: string): Problem[] {
  const problems: Problem[] = []
  for (const match of text.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    const target = match[1]
    if (SCHEME.test(target)) continue
    if (target.includes('#')) {
      problems.push({ file, line, message: `anchor cannot be checked offline "${target}"` })
      continue
    }
    if (!existsSync(resolve(root, dirname(file), decodeURIComponent(target)))) {
      problems.push({ file, line, message: `missing link target "${target}"` })
    }
  }
  return problems
}

function wordingProblems(file: string, line: number, text: string): Problem[] {
  let rest = text
  for (const compound of ALLOWED_COMPOUNDS) rest = rest.split(compound).join(' '.repeat(compound.length))
  const problems: Problem[] = []
  // Longer words first, so a word inside a longer banned word is reported once.
  for (const [word, replacement] of [...BANNED_WORDS].sort((a, b) => b[0].length - a[0].length)) {
    if (!rest.includes(word)) continue
    problems.push({ file, line, message: `"${word}" → ${replacement}` })
    rest = rest.split(word).join(' '.repeat(word.length))
  }
  for (const character of BANNED_CHARACTERS) {
    if (rest.includes(character)) problems.push({ file, line, message: `"${character}" → 日本語の字体` })
  }
  return problems
}

export function check(root: string): { problems: Problem[]; files: number; links: number } {
  const files = markdownFiles(root)
  const problems: Problem[] = []
  let links = 0
  for (const file of files) {
    for (const { line, text } of proseLines(readFileSync(join(root, file), 'utf8'))) {
      links += [...text.matchAll(/!?\[[^\]]*\]\(/g)].length
      problems.push(...linkProblems(root, file, line, text), ...wordingProblems(file, line, text))
    }
  }
  return { problems, files: files.length, links }
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { problems, files, links } = check(process.argv[2] ?? root)
for (const problem of problems) console.error(`${problem.file}:${problem.line}: ${problem.message}`)
console.log(`check: ${links} links in ${files} files, ${problems.length} problem${problems.length === 1 ? '' : 's'}`)
process.exit(problems.length === 0 ? 0 : 1)
