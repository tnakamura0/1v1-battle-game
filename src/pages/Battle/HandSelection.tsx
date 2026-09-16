import { ActionPromptBand } from '@/components/ActionPromptBand'
import { ActionTriangle } from '@/components/ActionTriangle'
import { BattleFrame } from '@/components/BattleFrame'
import { getIllegalReason } from '@/game/rules'
import type { Action, BattlePreset, IllegalReason, PlayerState, TurnRecord } from '@/game/types'
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

/**
 * 押せない理由を、ボタンに乗る短いチップの文言にする。
 *
 * **網羅的な switch にしてあるので、`default` を足さないこと。** かつては最後が
 * `` return `あと${n}T` `` のフォールバックで、理由を1つ増やしたときに
 * 無言でクールダウンの文言を借りてしまう形だった。理由を足したら
 * ここが型エラーになって気づけるようにしてある。
 */
function reasonLabel(reason: IllegalReason, guardCooldownRemaining: number): string {
  switch (reason) {
    case 'own-energy-zero':
      return 'ENERGY 0'
    case 'own-energy-max':
      return 'ENERGY MAX'
    case 'opponent-energy-zero':
      return '相手EN 0'
    case 'guard-cooldown':
      return `あと${guardCooldownRemaining}T`
  }
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
          動かすのはこの帯と行動ボタンだけ。枠（上下のステータスパネルと TURN n）と
          ターン履歴は動かさない。このコンポーネントは毎ターン作り直される
          （Battle.tsx が HandSelection と TurnResult を入れ替えるため）ので、
          ここに書いた動きは1試合で20回以上再生される。
          変わらない枠は止めたままにして、「自分の番が来た」ことだけを動かす。

          帯そのものは ActionPromptBand（LPのプレビューと共有）。動きだけをここで足す。
          高さ54px が BattleFrame の min-h-[54px] の根拠になっている経緯は、
          ActionPromptBand のコメントを参照。
        */
        <ActionPromptBand className="animate-fade-rise" />
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
