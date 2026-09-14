import { ActionTriangle } from '@/components/ActionTriangle'
import { getIllegalReason } from '@/game/rules'
import type { Action, BattlePreset, PlayerState, TurnRecord } from '@/game/types'
import { BattleFrame } from '@/pages/Battle/BattleFrame'
import { TurnHistoryList } from '@/pages/Battle/TurnHistoryList'
import { Versus } from '@/pages/Battle/Versus'

interface HandSelectionProps {
  player: PlayerState
  cpu: PlayerState
  preset: BattlePreset
  turn: number
  history: TurnRecord[]
  onSelectAction: (action: Action) => void
}

function reasonLabel(
  reason: 'own-energy-zero' | 'opponent-energy-zero' | 'guard-cooldown',
  guardCooldownRemaining: number,
): string {
  if (reason === 'own-energy-zero') return 'ENERGY 0'
  if (reason === 'opponent-energy-zero') return '相手EN 0'
  return `あと${guardCooldownRemaining}T`
}

/**
 * lg以上で履歴が右カラムへ移ったあとの空きに置く、対峙の表現。
 *
 * intro（誰と戦うか）→ 選択（対峙中）→ 結果（何が起きたか）を同じ構図でつなぐための
 * 装飾で、盤面から読み取れる情報を増やすものではない。この空きは lg 以上にしか
 * 存在しないため、ここに有利不利を左右するものを置くとデバイスで難易度が変わる。
 *
 * aria-hidden なのは、円が示す「自分と相手がいる」ことを StatusPanel が既に
 * 伝えているため。BattleIntro 側の Versus は本文なので aria-hidden にしていない。
 *
 * 高さの条件は、アリーナ（約150px）と上下の固定ブロック（約470px）の合計に余裕を
 * 見たもの。これがないと背の低いウィンドウで円が上下に切れる。
 */
function BattleArena() {
  return (
    <div
      aria-hidden
      className="hidden h-full flex-col items-center justify-center gap-4 lg:[@media(min-height:700px)]:flex"
    >
      <Versus />
      <p className="font-mono text-meta text-text-tertiary">両者の行動は同時に公開されます</p>
    </div>
  )
}

export function HandSelection({
  player,
  cpu,
  preset,
  turn,
  history,
  onSelectAction,
}: HandSelectionProps) {
  return (
    <BattleFrame
      maxHp={preset.initialHp}
      turn={turn}
      opponent={{ state: cpu }}
      player={{ state: player }}
      clipOnDesktop
      statusBand={
        /*
          動かすのはこのバナーと行動ボタンだけ。枠（上下のステータスパネルと TURN n）と
          ターン履歴は動かさない。このコンポーネントは毎ターン作り直される
          （Battle.tsx が HandSelection と TurnResult を入れ替えるため）ので、
          ここに書いた動きは1試合で20回以上再生される。
          変わらない枠は止めたままにして、「自分の番が来た」ことだけを動かす。

          **この帯の高さ 54px（py-4 の32px ＋ text-sm 1行の20px ＋ border 2px）が、
          BattleFrame のスロットの min-h-[54px] の根拠になっている。** 余白や文字サイズを
          変えるとスロットからはみ出し、その分だけ下の相手ステータスがずれて
          結果フェーズと食い違う。変えるときは両フェーズの高さを実測すること。
        */
        <div
          className="animate-fade-rise flex-none rounded-chip border border-accent/25 bg-accent/10 px-3 py-4 text-center font-sans text-sm font-semibold text-accent-light"
          aria-live="polite"
        >
          行動を選択してください
        </div>
      }
      actions={
        /*
          配置は ActionTriangle が持つ。LPのプレビューと同じものを使うことで乖離を防ぐ。

          動きは ActionTriangle の中ではなく外側の器に付ける。中に入れると
          LPのプレビュー（飾りとして置いてあるだけ）まで動いてしまう。
          3つを順にずらして出さないのは、三角形という並び自体が情報だから。
          バラバラに出ると、出そろうまで形が読めない。
        */
        <div className="animate-fade-rise">
          <ActionTriangle
            stateOf={(action) => {
              const reason = getIllegalReason(action, player, cpu)
              return {
                status: reason ? 'disabled' : 'idle',
                reasonLabel: reason
                  ? reasonLabel(reason, player.guardCooldownRemaining)
                  : undefined,
              }
            }}
            onSelect={onSelectAction}
          />
        </div>
      }
    >
      {/* lg未満は履歴、lg以上は対峙の表現。ちょうど裏返しの関係で入れ替わる */}
      {/* lg以上では履歴は右カラム（Battle.tsx の aside）に出るので、ここは隠す */}
      <div className="lg:hidden">
        <TurnHistoryList history={history} />
      </div>
      <BattleArena />
    </BattleFrame>
  )
}
