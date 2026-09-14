import type { ReactNode } from 'react'
import { StatusPanel } from '@/components/StatusPanel'
import type { PlayerState } from '@/game/types'

interface RoleView {
  state: PlayerState
  /** 直前のHP。結果フェーズだけ渡す（今回失ったセルを光らせる） */
  hpBefore?: number
}

interface BattleFrameProps {
  maxHp: number
  turn: number
  /** TURN n の右に出すフェーズ名（結果フェーズの 'RESULT'）。選択フェーズは出さない */
  phaseBadge?: string
  opponent: RoleView
  player: RoleView
  /** 今この画面で何が起きているかを伝える aria-live の帯 */
  statusBand: ReactNode
  /** 今回失ったHPセルを光らせる遅延。結果フェーズだけ渡す（components/motion.ts） */
  damageFlashDelayClass?: string
  /** 自分のステータスの下に置くもの（選択フェーズの行動ボタン） */
  actions?: ReactNode
  /** スクロールする中身 */
  children: ReactNode
  /**
   * lg以上でスクロールさせない。
   * 選択フェーズは lg 以上で履歴が右カラム（Battle.tsx の aside）へ移り、ここに
   * スクロールする中身がなくなる。h-full のアリーナが余分なスクロールを作らないよう切る。
   * 結果フェーズは lg 以上でも中身があふれうるので立てないこと。立てると無言で切り取られる。
   */
  clipOnDesktop?: boolean
}

/**
 * 対戦画面の枠。選択フェーズ（HandSelection）と結果フェーズ（TurnResult）が共有する。
 *
 * 並びは 相手ステータス → TURN n → 状態の帯 →（スクロールする中身）→ 自分ステータス → actions。
 * 相手は常に上、自分は常に下。
 *
 * ## 何が揃っていて、何が揃っていないか
 *
 * 上ブロック（相手ステータス・TURN n・状態の帯）は画面上端アンカーなので、
 * 両フェーズでY座標が一致する（実測で相手ステータス・TURN n とも差0px）。
 *
 * **下ブロックは画面下端アンカーなので、自分ステータスのYは `actions` の高さだけ上にずれる。**
 * 選択フェーズには ActionTriangle が入るぶん、結果フェーズより約214px 上に来る（375×667の実測）。
 * 揃っているのは順序（自分ステータスは常に下ブロックの先頭で、常に actions の上）だけ。
 *
 * これを承知で揃えていない。潰した案は2つある。
 * - 結果フェーズにも同じ高さの空き枠を確保する → 375×667 でスクロール領域が
 *   328px から114px まで縮み、結果が読めなくなる
 * - 自分ステータスを actions の下に置いて画面下端に揃える → 「自分のステータスは
 *   必ず行動ボタンより上」は Issue #82 の不変条件で、Battle.test.tsx / Home.test.tsx の
 *   対になるテストで固定されている
 *
 * このずれを見て「揃っていない」と位置合わせを入れないこと。Issue #111 / #112 が
 * まさにそれをやって、片方のずれを別のずれに置き換えただけで終わっている。
 *
 * ## なぜ切り出したか
 *
 * もとは上下のレイアウトが HandSelection と TurnResult に別々に書かれていた。その結果、
 * 共有しているはずの要素がフェーズごとに100〜240px も位置を変えていた（Issue #113 の実測）。
 * 相手ステータスは「最上部」と「スクロール内3番目」、自分ステータスは「最下部」と
 * 「スクロール内4番目」を行き来し、ターンごとに盤面が組み替わって見えていた。
 *
 * 位置を揃えるだけの修正を2度入れたが（Issue #111 / #112）、片方のずれを別のずれに
 * 置き換えるだけで終わった。レイアウトが2箇所にある限り再発するので、1箇所に集めた。
 * 実コンポーネントを使っていても「並べ方」までは追従しない——というのが Issue #82 で、
 * ActionTriangle を切り出して止めたのと同じ話。
 *
 * ## 枠にアニメーションを付けないこと
 *
 * ここは動かない枠で、動くのは中身（children / statusBand / actions）だけ。
 * フェーズが入れ替わるとこのコンポーネントは作り直されるので、枠に登場演出を付けると
 * 同じ位置にある同じパネルが毎ターン点滅する。
 *
 * 同じ理由で、結果フェーズだけステータスを薄くする（かつての dimmed）のもやめている。
 * 明るさがターンごとに往復すると、枠が固定されている意味がなくなる。
 */
export function BattleFrame({
  maxHp,
  turn,
  phaseBadge,
  opponent,
  player,
  statusBand,
  damageFlashDelayClass,
  actions,
  children,
  clipOnDesktop = false,
}: BattleFrameProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden">
      <div className="flex flex-none flex-col gap-3 p-4 pb-3">
        <StatusPanel
          role="opponent"
          state={opponent.state}
          hpBefore={opponent.hpBefore}
          maxHp={maxHp}
          damageFlashDelayClass={damageFlashDelayClass}
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] font-bold tracking-widest text-text-primary">
            TURN {turn}
          </span>
          {phaseBadge && (
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary">
              {phaseBadge}
            </span>
          )}
        </div>
        {statusBand}
      </div>

      {/*
        外側の flex-1 は残すこと。これを消すと上下のブロックがくっつき、
        下ブロック（自分のステータスと、あれば actions）が画面下端から離れてしまう。
      */}
      <div
        className={`min-h-0 flex-1 overflow-y-auto px-4 ${clipOnDesktop ? 'lg:overflow-hidden' : ''}`}
      >
        {children}
      </div>

      <div className="flex flex-none flex-col gap-3 border-t border-border-default p-4 pt-3">
        <StatusPanel
          role="player"
          state={player.state}
          hpBefore={player.hpBefore}
          maxHp={maxHp}
          damageFlashDelayClass={damageFlashDelayClass}
        />
        {actions}
      </div>
    </div>
  )
}
