import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 枠線だけのCTA（secondary）のホバー挙動が、画面ごとにずれていないことの確認。
 *
 * 同じ体裁のCTAが Home（components/ctaStyle.ts の SECONDARY_CTA_CLASS）、Rules、
 * BattleResult の3系統に分かれて書かれている。高さや幅は画面ごとに変える必要があるため
 * 1箇所には寄せていない（ctaStyle.ts のコメントを参照）。その結果、**カーソルを乗せたときに
 * 文字が明るくなるのが ctaStyle.ts 由来のものだけ**というずれが実際に発生した（Issue #157）。
 *
 * ホバー時に何色で描かれるかは jsdom では検証できない（CSSが評価されない）。DOMを見ても
 * クラスが当たっているかどうかしか分からない。そこで**ソースを読んで、secondary CTA の
 * 体裁を持つクラス文字列がすべて同じホバー指定を持つこと**を見る。index.css のはしごを
 * 固定している test/fontSize.test.ts と同じ形。
 *
 * **拾えるのは「今あるパターンのコピー」だけ。** 別のトークンで書かれた新しいCTAは
 * 署名に合わず素通りする。このテストがあるから安全、とは考えないこと。
 */
const SRC = join(process.cwd(), 'src')

/**
 * secondary CTA とみなす署名。3つすべてを**同じ行に**含むものを対象にする。
 *
 * 末尾の否定先読みは、不透明度つきの `hover:border-accent/60`（components/ActionButton.tsx）の
 * ような書き方を拾わないための保険。**現状のあちらは text-text-secondary を持たないので、
 * 先読みがなくても署名からは外れる。** 似た書き方が増えたときに効く。
 */
const SIGNATURE = [
  /\bborder-border-emphasis(?![\w/-])/,
  /\btext-text-secondary(?![\w/-])/,
  /\bhover:border-accent(?![\w/-])/,
]

/**
 * ホバーで文字を明るくする指定。署名に一致した行はすべてこれを持つ。
 * 署名と同じく前後を締めてあるので、`group-hover:` や `sm:hover:` の派生は別物として扱う。
 */
const BRIGHTEN_TEXT_ON_HOVER = /(?<![\w:-])hover:text-text-primary(?![\w/-])/

/**
 * 署名に一致する箇所の数。増減したらここも直す。
 * 0件一致のまま素通りする空振りを防ぐために固定している。
 */
const EXPECTED_COUNT = 3

/**
 * src配下の .ts / .tsx を集める。
 *
 * **テストファイルは除外する。** 今のところ除外しなくても結果は変わらない
 * （このファイルの署名は3行に分かれていて「同じ行に3つ」を満たさない）が、
 * クラス文字列を丸ごと書いたアサーションを持つテストが増えると自己一致しうる。
 */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    if (!/\.tsx?$/.test(entry.name)) return []
    if (/\.test\.tsx?$/.test(entry.name)) return []
    return [path]
  })
}

/*
  行単位で見ている。**クラス文字列を複数行に分けると拾えない。**
  現状の3箇所はいずれも1行に収まっていて、Prettierは文字列リテラルを折らないので成立する。
  折らざるを得ないほど長くなったら、そのときは一致数が減って気づける。
*/
const secondaryCtaLines = sourceFiles(SRC).flatMap((path) =>
  readFileSync(path, 'utf8')
    .split('\n')
    .map((text, index) => ({ at: `${relative(process.cwd(), path)}:${index + 1}`, text }))
    .filter(({ text }) => SIGNATURE.every((pattern) => pattern.test(text))),
)

describe('secondary CTA のホバー', () => {
  it(`署名に一致するのは ${EXPECTED_COUNT} 箇所`, () => {
    expect(secondaryCtaLines.map(({ at }) => at)).toHaveLength(EXPECTED_COUNT)
  })

  it('すべてホバーで文字が明るくなる', () => {
    const missing = secondaryCtaLines
      .filter(({ text }) => !BRIGHTEN_TEXT_ON_HOVER.test(text))
      .map(({ at }) => at)

    expect(missing).toEqual([])
  })
})
