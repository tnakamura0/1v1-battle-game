import { useEffect, useReducer, useState } from 'react'
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

function BattleSession({ preset }: { preset: BattlePreset }) {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(battleReducer, preset, createInitialBattleState)
  const [secondsRemaining, setSecondsRemaining] = useState(0)

  useEffect(() => {
    if (state.phase !== 'intro') return
    const timeoutId = window.setTimeout(
      () => dispatch({ type: 'INTRO_COMPLETE' }),
      INTRO_DURATION_MS,
    )
    return () => window.clearTimeout(timeoutId)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'result') return

    const totalMs = state.winner ? RESULT_DURATION_ON_VICTORY_MS : RESULT_DURATION_MS
    setSecondsRemaining(Math.ceil(totalMs / 1000))

    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      const remainingMs = Math.max(0, totalMs - (Date.now() - startedAt))
      setSecondsRemaining(Math.ceil(remainingMs / 1000))
    }, 200)

    const timeoutId = window.setTimeout(() => {
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
    }, totalMs)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [state, navigate])

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-bg-page">
      {state.phase === 'intro' ? (
        <BattleIntro preset={preset} />
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
          secondsRemaining={secondsRemaining}
          isFinal={state.winner !== null}
        />
      ) : null}
    </main>
  )
}
