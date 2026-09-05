import { useEffect, useReducer, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { battleReducer, createInitialBattleState } from '@/game/battleReducer'
import {
  INTRO_DURATION_MS,
  RESULT_DURATION_MS,
  RESULT_DURATION_ON_VICTORY_MS,
} from '@/game/presets'
import type { BattlePreset, BattleSummary } from '@/game/types'
import { BattleIntro } from '@/pages/Battle/BattleIntro'
import { HandSelection } from '@/pages/Battle/HandSelection'
import { TurnResult } from '@/pages/Battle/TurnResult'

interface BattleLocationState {
  preset?: BattlePreset
}

export function Battle() {
  const location = useLocation()
  const preset = (location.state as BattleLocationState | null)?.preset

  if (!preset) {
    return <Navigate to="/preset" replace />
  }

  return <BattleSession key={location.key} preset={preset} />
}

/**
 * `active` になっている間だけ `totalMs` を秒単位でカウントダウンし、0に達したら
 * `onComplete` を呼ぶ。intro/resultの両フェーズで同じタイマーパターンを共有するための
 * ローカルフック。`onComplete` はrefで保持し、effectの依存配列を最小限に保つ。
 */
function useCountdown(active: boolean, totalMs: number, onComplete: () => void): number {
  const [secondsRemaining, setSecondsRemaining] = useState(() => Math.ceil(totalMs / 1000))
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!active) return
    setSecondsRemaining(Math.ceil(totalMs / 1000))

    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      setSecondsRemaining(Math.ceil(Math.max(0, totalMs - (Date.now() - startedAt)) / 1000))
    }, 200)
    const timeoutId = window.setTimeout(() => onCompleteRef.current(), totalMs)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [active, totalMs])

  return secondsRemaining
}

function BattleSession({ preset }: { preset: BattlePreset }) {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(battleReducer, preset, createInitialBattleState)

  const introSeconds = useCountdown(state.phase === 'intro', INTRO_DURATION_MS, () =>
    dispatch({ type: 'INTRO_COMPLETE' }),
  )

  const resultTotalMs = state.winner ? RESULT_DURATION_ON_VICTORY_MS : RESULT_DURATION_MS
  const resultSeconds = useCountdown(state.phase === 'result', resultTotalMs, () => {
    if (state.winner) {
      const summary: BattleSummary = {
        preset: state.preset,
        winner: state.winner,
        player: state.player,
        cpu: state.cpu,
        turnCount: state.turn,
      }
      navigate('/battle/result', { state: { summary }, replace: true })
    } else {
      dispatch({ type: 'ADVANCE_TURN' })
    }
  })

  return (
    <main className="mx-auto flex h-dvh w-full max-w-6xl flex-col overflow-hidden bg-bg-page">
      {state.phase === 'intro' ? (
        <BattleIntro preset={preset} secondsRemaining={introSeconds} />
      ) : state.phase === 'selecting' ? (
        <HandSelection
          player={state.player}
          cpu={state.cpu}
          preset={preset}
          turn={state.turn}
          history={state.history}
          onSelectAction={(action) => dispatch({ type: 'SUBMIT_PLAYER_ACTION', action })}
        />
      ) : state.lastTurn ? (
        <TurnResult
          lastTurn={state.lastTurn}
          preset={preset}
          turn={state.turn}
          secondsRemaining={resultSeconds}
          isFinal={state.winner !== null}
        />
      ) : null}
    </main>
  )
}
