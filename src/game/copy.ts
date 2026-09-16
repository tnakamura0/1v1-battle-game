import { matchRecommendedSetup, toSetup } from '@/game/presets'
import type { Action, BattlePreset, CpuDifficulty, TurnOutcome } from '@/game/types'

export const ACTION_LABEL: Record<Action, string> = {
  charge: 'チャージ',
  attack: '攻撃',
  guard: 'ガード',
}

export const CPU_DIFFICULTY_LABEL: Record<CpuDifficulty, string> = {
  normal: 'ふつう',
  strong: 'つよい',
}

/**
 * 設定値を3つのチップに分ける。1本の文字列（`HP2 ／ ガード3ターン ／ CPUふつう`）だと
 * カードが3枚並んだときに幅が足りず、区切り文字の途中で折り返して読みにくくなる。
 * チップ単位なら折り返しても意味の切れ目で折れる。
 *
 * 「ターン」を「T」に略さず、「つよい」に CPU を付けたままにしているのは、
 * チップがボタンのアクセシブルネームの一部として読み上げられるため。
 * 「サドンデス 一撃で決着 HP1 ガード1T つよい」では何がつよいのか分からない。
 * この3語は ruleLabel 経由で共有テキストにもそのまま出るので、
 * 画面の外に出ても意味が通ることが要る。
 */
export function setupChips(preset: BattlePreset): string[] {
  const setup = toSetup(preset)
  return [
    `HP${setup.initialHp}`,
    `ガード${setup.guardCooldownTurns}ターン`,
    `CPU${CPU_DIFFICULTY_LABEL[setup.cpuDifficulty]}`,
  ]
}

/**
 * 対戦ルールの呼び名。結果画面の成績表と、Xへの共有テキストで使う（Issue #131）。
 *
 * おすすめ設定と一致すればその名前を、しなければ設定値そのものを並べる。
 * 「カスタムルール」のような語は使わない。読み手に何も伝えないうえ、
 * 名前のない状態を名前で埋めているだけになるため。
 */
export function ruleLabel(preset: BattlePreset): string {
  return matchRecommendedSetup(preset)?.title ?? setupChips(preset).join('・')
}

export function outcomeHeadline(outcome: TurnOutcome): string {
  switch (outcome) {
    case 'player-hit-cpu':
    case 'cpu-hit-player':
      return '命中'
    case 'clash':
      return '相打ち'
    case 'player-guarded':
    case 'cpu-guarded':
      return 'ガード成功'
    case 'no-effect':
      return '変化なし'
    default:
      return '変化なし'
  }
}

export function outcomeHistoryLine(outcome: TurnOutcome): string {
  switch (outcome) {
    case 'player-hit-cpu':
      return '→ 相手 HP -1'
    case 'cpu-hit-player':
      return '→ 自分 HP -1'
    case 'clash':
      return '→ 相打ち・ダメージなし'
    case 'player-guarded':
      return '→ ガード成功・自分のエネルギー+1'
    case 'cpu-guarded':
      return '→ ガード成功・相手のエネルギー+1'
    case 'no-effect':
      return '→ 変化なし'
    default:
      return '→ 変化なし'
  }
}
