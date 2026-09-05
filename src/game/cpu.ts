import { getLegalActions } from '@/game/rules'
import type { Action, BattlePreset, PlayerState } from '@/game/types'

const BASE_WEIGHT = 1

export function decideCpuAction(
  cpu: PlayerState,
  human: PlayerState,
  _preset: BattlePreset,
  rng: () => number = Math.random,
): Action {
  const legalActions = getLegalActions(cpu, human)
  const weights = new Map<Action, number>(legalActions.map((action) => [action, BASE_WEIGHT]))

  const bumpWeight = (action: Action, multiplier: number) => {
    const current = weights.get(action)
    if (current === undefined) return
    weights.set(action, current * multiplier)
  }

  // 相手のHPが少ない、または自エネルギーが潤沢なときは攻撃を優先する
  if (human.hp <= 1) {
    bumpWeight('attack', 3)
  } else if (cpu.energy >= 4) {
    bumpWeight('attack', 2)
  }

  // 自エネルギーが少ないときはチャージを優先する
  if (cpu.energy === 0) {
    bumpWeight('charge', 4)
  } else if (cpu.energy <= 1) {
    bumpWeight('charge', 2)
  }

  // 相手が攻撃してくる可能性がある（エネルギーを持っている）ときはガードを優先する
  if (human.energy > 0) {
    bumpWeight('guard', 2.5)
  }

  return pickWeighted(weights, rng)
}

function pickWeighted(weights: Map<Action, number>, rng: () => number): Action {
  const entries = Array.from(weights.entries())
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  const threshold = rng() * total

  let cumulative = 0
  for (const [action, weight] of entries) {
    cumulative += weight
    if (threshold < cumulative) return action
  }

  // 浮動小数点誤差でしきい値を超えなかった場合のフォールバック
  return entries[entries.length - 1][0]
}
