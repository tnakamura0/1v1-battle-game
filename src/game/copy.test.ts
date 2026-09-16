import { describe, expect, it } from 'vitest'
import { outcomeHeadline, outcomeHistoryLine, ruleLabel, setupChips } from '@/game/copy'

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

describe('setupChips', () => {
  it('spells out each setting so the chips stand alone', () => {
    expect(setupChips({ initialHp: 3, guardCooldownTurns: 2, cpuDifficulty: 'strong' })).toEqual([
      'HP3',
      'ガード2ターン',
      'CPUつよい',
    ])
  })

  it('falls back to the default difficulty when it is omitted', () => {
    expect(setupChips({ initialHp: 1, guardCooldownTurns: 1 })).toEqual([
      'HP1',
      'ガード1ターン',
      'CPUふつう',
    ])
  })
})

describe('ruleLabel', () => {
  it('names the recommendation when the setup matches one', () => {
    expect(ruleLabel({ initialHp: 1, guardCooldownTurns: 1, cpuDifficulty: 'strong' })).toBe(
      'サドンデス',
    )
  })

  /*
   * 一致しないときは設定値をそのまま並べる。「カスタムルール」のような語は使わない
   * （読み手に何も伝わらないため。copy.ts の ruleLabel のコメントを参照）。
   */
  it('lists the actual settings when the setup matches no recommendation', () => {
    expect(ruleLabel({ initialHp: 2, guardCooldownTurns: 2, cpuDifficulty: 'strong' })).toBe(
      'HP2・ガード2ターン・CPUつよい',
    )
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
