import { describe, expect, it } from 'vitest'
import { outcomeHeadline, outcomeHistoryLine } from '@/game/copy'

describe('outcomeHeadline', () => {
  it('reports 命中 for either direction of a hit', () => {
    expect(outcomeHeadline('player-hit-cpu')).toBe('命中')
    expect(outcomeHeadline('cpu-hit-player')).toBe('命中')
  })

  it('reports ガード成功 for either direction of a block', () => {
    expect(outcomeHeadline('player-guarded')).toBe('ガード成功')
    expect(outcomeHeadline('cpu-guarded')).toBe('ガード成功')
  })

  it('reports 相打ち for a clash and 変化なし otherwise', () => {
    expect(outcomeHeadline('clash')).toBe('相打ち')
    expect(outcomeHeadline('no-effect')).toBe('変化なし')
  })
})

describe('outcomeHistoryLine', () => {
  it('describes damage direction explicitly', () => {
    expect(outcomeHistoryLine('player-hit-cpu')).toBe('→ 相手 HP -1')
    expect(outcomeHistoryLine('cpu-hit-player')).toBe('→ 自分 HP -1')
  })

  it('describes which side gained energy from a successful guard', () => {
    expect(outcomeHistoryLine('player-guarded')).toBe('→ ガード成功・自分のエネルギー+1')
    expect(outcomeHistoryLine('cpu-guarded')).toBe('→ ガード成功・相手のエネルギー+1')
  })
})
