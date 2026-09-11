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
import { TurnHistoryList } from '@/pages/Battle/TurnHistoryList'
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
    /*
      lg以上は「左＝バトル / 右＝ターン履歴」の2カラム。
      左カラムを lg:w-112（=max-w-md と同じ448px）で固定しているのが要で、これがないと
      選択フェーズと結果フェーズで幅が変わり、ターンごとにレイアウトが揺れる。
      もとは max-w-6xl が指定されていたが、子が max-w-md で潰していて効いていなかった。
    */
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-bg-page lg:max-w-4xl lg:flex-row lg:justify-center">
      {/*
        lg未満（縦積み）は flex-1 で画面の高さいっぱいに伸ばす。これがないと
        中身の高さで止まり、自分のステータスと行動ボタンが画面下端から離れる。
        lg以上（横並び）は伸縮させず lg:w-112 の固定幅にする。
      */}
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden lg:w-112 lg:flex-none">
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
      </div>

      {/*
        introフェーズでも描画する。3秒後に急にカラムが増えると画面が揺れるため。
        履歴が空のうちは TurnHistoryList の「まだ履歴はありません」がそのまま出る。

        lg未満では HandSelection の中に履歴がある（このasideは display:none）。
        「上ブロック / 履歴 / 下ブロック」と「左カラム / 右カラム」はCSSで移動できる
        関係にないので、履歴はDOM上2つ持つしかない。display:none は
        アクセシビリティツリーからも除かれるため、支援技術に届くのは常に片方だけ。
      */}
      <aside
        aria-label="ターン履歴"
        className="hidden lg:flex lg:min-h-0 lg:w-85 lg:flex-none lg:flex-col lg:border-l lg:border-border-default lg:p-4"
      >
        {/*
          スクロールはこのブロックが持つ。TurnHistoryList を直接 flex の子にすると
          中の ul の flex-1 が効いて、履歴が数件でも bg-bg-track の帯が
          カラムの高さいっぱいに伸びてしまう。HandSelection 側と同じ構造。
        */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TurnHistoryList history={state.history} />
        </div>
      </aside>
    </main>
  )
}
