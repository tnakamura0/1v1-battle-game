import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CURTAIN_DELAY, RESULT_DELAY } from '@/components/motion'

/**
 * 最終結果画面の段取り（CURTAIN_DELAY / RESULT_DELAY）の前後関係の確認。
 *
 * 遅延はTailwindの制約でリテラル文字列になっていて（motion.ts の冒頭を参照）、
 * 値どうしを計算で結べない。gameOver だけは CURTAIN_DELAY.out を参照しているので追従するが、
 * 残りは追従しない。幕の遅延だけを動かすと順序が黙って逆転する
 * （たとえば out を1500msにすると、見出しがまだ不透明な幕の下で出てしまう）。
 * lint も型検査も通り、jsdom ではCSSが評価されないので既存のテストも通るため、ここで固定している。
 *
 * 幕がタップを受け止める長さ（index.css の curtain-hide）もここで段取りと突き合わせる。
 * CSSの側にある数値なので、test/fontSize.test.ts と同じくソースを読む。
 */
const INDEX_CSS = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8')

/** '[animation-delay:1100ms]' → 1100 */
function delayMs(delayClass: string): number {
  const match = /^\[animation-delay:(\d+)ms\]$/.exec(delayClass)
  if (!match) throw new Error(`遅延のクラスとして読めない: ${delayClass}`)
  return Number(match[1])
}

describe('最終結果画面の段取り', () => {
  const gameOver = delayMs(RESULT_DELAY.gameOver)
  const actions = delayMs(RESULT_DELAY.actions)

  it('画面本体は、幕が消え始めるところから出る', () => {
    expect(gameOver).toBe(delayMs(CURTAIN_DELAY.out))
  })

  it('GAME OVER → 見出し → 成績行（上から順）→ ボタンの順に出る', () => {
    const order = [
      gameOver,
      delayMs(RESULT_DELAY.headline),
      ...RESULT_DELAY.stats.map(delayMs),
      actions,
    ]
    expect(order).toEqual([...new Set(order)].sort((a, b) => a - b))
  })

  /* 主目的の「もう一度対戦する」が見えるまでを伸ばさない（RESULT_DELAY の説明を参照） */
  it('ボタンは gameOver から480ms以内に出始める', () => {
    expect(actions - gameOver).toBeLessThanOrEqual(480)
  })

  /*
    短いと、幕が透明になってからボタンが出始めるまでの間、見えていないボタンが押せる。
    長いと、出てきたボタンを押しても幕に吸われる。
  */
  it('幕がタップを受け止めるのは、ちょうどボタンが出始めるところまで', () => {
    const match = /--animate-curtain-out:[^;]*\bcurtain-hide (\d+)ms/.exec(INDEX_CSS)
    expect(match).not.toBeNull()
    expect(delayMs(CURTAIN_DELAY.out) + Number(match?.[1])).toBe(actions)
  })
})
