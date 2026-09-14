import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * フォントサイズのはしご（index.css の @theme）が消えていないことの確認。
 *
 * 任意値（text-[9px] など）を書かせない側は ESLint の no-restricted-syntax で止めている
 * （eslint.config.js。行動色の直書きを止めているのと同じ形）。こちらで見るのは
 * **はしごの側が存在しているか**だけで、これは ESLint には見えない。
 *
 * トークンが消えると text-meta / text-chip は未定義のクラスになり、エラーも警告も出ないまま
 * 全ラベルが継承値（16px）に戻る。lint も型検査も通り、既存のテストも通ってしまう。
 * 対戦画面のラベルが軒並み16pxになるという、いちばん大きな壊れ方が誰にも見えないので、
 * ここで固定している。
 *
 * サイズが実際に何pxで描かれるかは jsdom では検証できない（CSSが評価されない）。
 * そちらはブラウザでの実測に任せている。
 */
const INDEX_CSS = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8')

describe('フォントサイズのはしご', () => {
  it.each([
    ['--text-chip', '10px'],
    ['--text-meta', '11px'],
  ])('%s が @theme に定義されている', (token, size) => {
    expect(INDEX_CSS).toContain(`${token}: ${size};`)
  })

  /*
    対の line-height を定義しないことがはしごの前提（index.css のコメントを参照）。
    定義すると、そのサイズだけ html の 1.5 の継承から外れて行の高さが変わり、
    文字サイズを触っていない要素まで動く。
  */
  it('トークンに line-height を対にしていない', () => {
    expect(INDEX_CSS).not.toMatch(/--text-(chip|meta)--line-height/)
  })
})
