import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * CTAの体裁が components/ctaStyle.ts の外に書かれていないことの確認。
 *
 * かつては同じ体裁のCTAが5画面・9箇所に、7本のクラス文字列で書かれていた。コピーで
 * 育った結果、secondary にカーソルを乗せたとき文字が明るくなるのが一部だけ、というずれが
 * 実際に起きていた（Issue #157）。Issue #159 で ctaClass に一本化したので、**ずれが
 * 起きうる前提そのものが無くなった。** ここではその状態が崩れていないことだけを見る。
 *
 * かつてこの位置には「コピーがすべて同じホバー指定を持つ」ことを見るテストがあったが、
 * 一本化でコピーが消えたため、**「そもそもコピーが無い」というより強い条件に置き換えた。**
 *
 * ホバー時に何色で描かれるかは jsdom では検証できない（CSSが評価されない）。DOMを見ても
 * クラスが当たっているかどうかしか分からない。そこでソースを読む。index.css のはしごを
 * 固定している test/fontSize.test.ts と同じ形。
 *
 * **拾えるのは「今あるトークンでCTAを直書きした場合」だけ。** 次はいずれも素通りする。
 * このテストがあるから安全、とは考えないこと。
 *
 * - 別のトークンで似た見た目を作る（ホバーを持たない primary 風のCTAなど）
 * - クラス文字列を複数行に分ける（行単位で見ているため）
 * - secondary で枠線のホバー指定を枠線の色より**前**に書く（後方を見る先読みのため）
 */
const SRC = join(process.cwd(), 'src')

/** CTAの体裁を持つ唯一の場所。ここだけは目印を持っていてよい */
const SINGLE_SOURCE = join('src', 'components', 'ctaStyle.ts')

/**
 * CTAの目印。どちらか片方でも ctaStyle.ts の外に現れたら、直書きが復活している。
 *
 * primary は面の色が変わるホバー、secondary は枠線の色が変わるホバーで見分ける。
 * 前後を締めてあるのは、不透明度つきの書き方（行動ボタンが使っている）や、
 * 接頭辞の付いた派生（要素にカーソルを乗せたときに子を変える類い、画面幅つきの指定）を
 * 別物として扱うため。
 */
const CTA_MARKERS = [
  { tone: 'primary', pattern: /(?<![\w:-])hover:bg-accent-hover(?![\w/-])/ },
  {
    tone: 'secondary',
    pattern: /border-border-emphasis(?![\w/-])(?=.*(?<![\w:-])hover:border-accent(?![\w/-]))/,
  },
] as const

/**
 * src配下の .ts / .tsx を集める。
 *
 * **テストファイルは除外する。** 目印の正規表現を並べたこのファイル自身が
 * 引っかかるのを避けるため。
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

/** 目印を持つ箇所を `ファイル:行` で返す。行単位で見るので、複数行に分けると拾えない */
function markerHits(pattern: RegExp): string[] {
  return sourceFiles(SRC).flatMap((path) =>
    readFileSync(path, 'utf8')
      .split('\n')
      .map((text, index) => ({ at: `${relative(process.cwd(), path)}:${index + 1}`, text }))
      .filter(({ text }) => pattern.test(text))
      .map(({ at }) => at),
  )
}

describe('CTAの体裁は ctaStyle.ts にしかない', () => {
  it.each(CTA_MARKERS)('$tone の目印は ctaStyle.ts だけに現れる', ({ pattern }) => {
    const outside = markerHits(pattern).filter((at) => !at.startsWith(SINGLE_SOURCE))

    expect(outside).toEqual([])
  })

  /*
    上のテストは「0件であること」を見るので、目印が効かなくなっても（トークン名を変えた、
    クラス文字列を複数行に分けた）0件のまま通ってしまう。ctaStyle.ts 側で必ず1件
    見つかることを確かめて、その空振りを防ぐ。
  */
  it.each(CTA_MARKERS)('$tone の目印が ctaStyle.ts で見つかる', ({ pattern }) => {
    expect(markerHits(pattern)).toContainEqual(expect.stringContaining(SINGLE_SOURCE))
  })
})
