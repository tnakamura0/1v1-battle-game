import { getLegalActions } from '@/game/rules'
import type { Action, BattlePreset, CpuDifficulty, PlayerState, TurnRecord } from '@/game/types'

const BASE_WEIGHT = 1
const PATTERN_WINDOW = 3

// 各行動に対する「読み合い」上の最適な返し手。
// charge→attack（無償で1ダメージ）、attack→guard（防御+エネルギー獲得）、
// guard→charge（ガードに攻撃を当てて損をしない）
const COUNTER_ACTION: Record<Action, Action> = {
  charge: 'attack',
  attack: 'guard',
  guard: 'charge',
}

interface CpuDecisionContext {
  difficulty?: CpuDifficulty
  history?: TurnRecord[]
}

export function decideCpuAction(
  cpu: PlayerState,
  human: PlayerState,
  _preset: BattlePreset,
  rng: () => number = Math.random,
  { difficulty = 'normal', history = [] }: CpuDecisionContext = {},
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

  if (difficulty === 'strong') {
    const predicted = predictHumanAction(history)
    if (predicted) {
      bumpWeight(COUNTER_ACTION[predicted], 3)
      if (predicted === 'guard') {
        // 予測が外れて攻撃がガードされると相手にエネルギーも与えてしまうため、
        // 「ガードを読んだ」ときは攻撃の重みを積極的に下げる
        bumpWeight('attack', 1 / 3)
      }
    }
  }

  return pickWeighted(weights, rng)
}

// 直近PATTERN_WINDOW手の最頻出行動を「次も来る」と予測する。
// サンプルが1手以下、または票が割れて傾向がない場合は予測しない（null）。
function predictHumanAction(history: TurnRecord[]): Action | null {
  const recent = history.slice(0, PATTERN_WINDOW).map((turn) => turn.playerAction)
  if (recent.length < 2) return null

  const counts = new Map<Action, number>()
  for (const action of recent) {
    counts.set(action, (counts.get(action) ?? 0) + 1)
  }

  let best: Action | null = null
  let bestCount = 0
  for (const [action, count] of counts) {
    if (count > bestCount) {
      best = action
      bestCount = count
    }
  }
  if (bestCount <= 1) return null
  return best
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
