import { MAX_ENERGY } from '@/game/presets'
import type {
  Action,
  BattlePreset,
  IllegalReason,
  PlayerKey,
  PlayerState,
  TurnOutcome,
} from '@/game/types'

export function createInitialPlayerState(preset: BattlePreset): PlayerState {
  return {
    hp: preset.initialHp,
    energy: 0,
    guardCooldownRemaining: 0,
  }
}

export function getIllegalReason(
  action: Action,
  own: PlayerState,
  opponent: PlayerState,
): IllegalReason | null {
  if (action === 'attack') {
    return own.energy > 0 ? null : 'own-energy-zero'
  }
  if (action === 'guard') {
    if (opponent.energy === 0) return 'opponent-energy-zero'
    if (own.guardCooldownRemaining > 0) return 'guard-cooldown'
    return null
  }
  /*
   * チャージは上限に達していたら選べない（Issue #134）。増えないうえ、攻撃に対しては
   * 負ける側（下の resolveTurn を参照）なので、上限で選ぶと被弾のリスクだけを負う。
   *
   * **まったく無意味だったわけではない。** 相手のガードを読んだターンは、攻撃すると
   * 相手にエネルギーを1献上してしまう（attack×guard）ので、上限でのチャージは
   * それを避ける「パス」として機能していた。それでも禁じたのは、上限で塩漬けになって
   * 的になり続ける害のほうが大きいと判断したため。この弱い選択肢が消える副作用は
   * 承知のうえで入れている。
   */
  return own.energy >= MAX_ENERGY ? 'own-energy-max' : null
}

export function isActionLegal(action: Action, own: PlayerState, opponent: PlayerState): boolean {
  return getIllegalReason(action, own, opponent) === null
}

/**
 * 合法手の一覧。
 *
 * **空にはならない。** チャージが外れるのはエネルギーが上限のときだけで、
 * そのとき攻撃は必ず合法（`energy > 0`）だから。CPU側はこの性質に依存している
 * （game/cpu.ts の toSoftmaxWeights / predictHumanDistribution を参照）ので、
 * 非合法になる条件を増やすときはここが空になりうるかを必ず確かめること。
 *
 * 並びは charge → attack → guard で固定。行動ボタンのDOM順（components/actionStyle.ts の
 * ACTION_ORDER）と揃えてあるので、片方だけ並べ替えないこと。
 */
export function getLegalActions(own: PlayerState, opponent: PlayerState): Action[] {
  const actions: Action[] = []
  if (isActionLegal('charge', own, opponent)) actions.push('charge')
  if (isActionLegal('attack', own, opponent)) actions.push('attack')
  if (isActionLegal('guard', own, opponent)) actions.push('guard')
  return actions
}

function nextGuardCooldown(
  current: number,
  usedGuardThisTurn: boolean,
  guardCooldownTurns: number,
): number {
  if (usedGuardThisTurn) return guardCooldownTurns
  return Math.max(0, current - 1)
}

function applyOwnAction(state: PlayerState, action: Action): PlayerState {
  if (action === 'charge') {
    /*
     * 上限で頭打ちにする。getIllegalReason が上限でのチャージを弾くようになったので、
     * 正規の操作からこの Math.min が効くことはもうない。それでも残しているのは、
     * resolveTurn も battleReducer も行動の合法性を検証しておらず、
     * 押させないのはUIだけだから。ここが最後の砦になる。
     * ガード成功側（下の +1）の上限は、今も正規の経路で効く。
     */
    return { ...state, energy: Math.min(MAX_ENERGY, state.energy + 1) }
  }
  if (action === 'attack') {
    return { ...state, energy: state.energy - 1 }
  }
  return { ...state }
}

export function resolveTurn(
  player: PlayerState,
  cpu: PlayerState,
  playerAction: Action,
  cpuAction: Action,
  preset: BattlePreset,
): { player: PlayerState; cpu: PlayerState; outcome: TurnOutcome } {
  let nextPlayer = applyOwnAction(player, playerAction)
  let nextCpu = applyOwnAction(cpu, cpuAction)

  let outcome: TurnOutcome = 'no-effect'

  if (playerAction === 'attack' && cpuAction === 'attack') {
    outcome = 'clash'
  } else if (playerAction === 'attack' && cpuAction === 'charge') {
    nextCpu = { ...nextCpu, hp: Math.max(0, nextCpu.hp - 1) }
    outcome = 'player-hit-cpu'
  } else if (cpuAction === 'attack' && playerAction === 'charge') {
    nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - 1) }
    outcome = 'cpu-hit-player'
  } else if (playerAction === 'attack' && cpuAction === 'guard') {
    nextCpu = { ...nextCpu, energy: Math.min(MAX_ENERGY, nextCpu.energy + 1) }
    outcome = 'cpu-guarded'
  } else if (cpuAction === 'attack' && playerAction === 'guard') {
    nextPlayer = { ...nextPlayer, energy: Math.min(MAX_ENERGY, nextPlayer.energy + 1) }
    outcome = 'player-guarded'
  }

  nextPlayer = {
    ...nextPlayer,
    guardCooldownRemaining: nextGuardCooldown(
      player.guardCooldownRemaining,
      playerAction === 'guard',
      preset.guardCooldownTurns,
    ),
  }
  nextCpu = {
    ...nextCpu,
    guardCooldownRemaining: nextGuardCooldown(
      cpu.guardCooldownRemaining,
      cpuAction === 'guard',
      preset.guardCooldownTurns,
    ),
  }

  return { player: nextPlayer, cpu: nextCpu, outcome }
}

export function checkVictory(player: PlayerState, cpu: PlayerState): PlayerKey | null {
  if (player.hp <= 0) return 'cpu'
  if (cpu.hp <= 0) return 'player'
  return null
}
