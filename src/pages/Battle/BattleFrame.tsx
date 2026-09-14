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
 * 並びは TURN n → 状態の帯 → 相手ステータス →（スクロールする中身）→ 自分ステータス → actions。
 * つまり「メタ情報 → 相手 → 中身 → 自分」で、相手は常に上、自分は常に下。
 *
 * ## なぜ TURN n と帯が相手ステータスより上なのか
 *
 * もとは 相手ステータス → TURN n → 状態の帯 の順だった。ところが TURN n だけが
 * 面を持たない素のテキストで、面のあるカード2枚（相手ステータスと帯）に挟まれるため、
 * **区切り線のように働いて相手ステータスを画面上部に分断していた**（Issue #115）。
 *
 * メタ情報（TURN n と帯）を上でまとめ、相手ステータスを中身のすぐ上に置くことで、
 * 相手ステータスが盤面の一部として読めるようにしている。
 * メタ情報の中だけ gap-2、そこから相手ステータスまでは gap-3 と間隔を変えているのは、
 * この「組」を間隔で示すため。均等に戻さないこと。
 *
 * ## 何が揃っていて、何が揃っていないか
 *
 * 上ブロックは画面上端アンカーで、**かつ帯のスロットを固定高にしている**ので、
 * 両フェーズでY座標が一致する。実測（390×844）:
 * - TURN n … 26px / 26px
 * - 帯のスロット … top 44px・高さ54px（両フェーズとも同じ）
 * - 相手ステータス … 138px / 138px
 *
 * 上端アンカーだけでは揃わない。帯の中身は高さがフェーズで違う（選択54px / 結果44px）ため、
 * 素で並べると差がそのまま下の盤面に伝わる。スロットの min-h がそれを吸収している
 * （下の実装のコメントを参照。外すと相手ステータスが毎ターン10px動く）。
 *
 * その代わり、結果フェーズでは44pxの帯が54pxのスロットに中央寄せされる。
 * 帯そのものの上端は5px下がり、見た目の間隔は 8px/12px ではなく 13px/17px になる
 * （帯の中心は両フェーズとも71pxで一致する）。カードの位置を揃えることを優先した結果で、
 * 承知のうえ。間隔を揃えにいくと今度は盤面が動く。
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
        {/*
          メタ情報（何ターン目か・今この画面で何が起きているか）。
          外側の gap-3 より狭い gap-2 で寄せて、下の相手ステータスとは別の組に見せる。
        */}
        <div className="flex flex-col gap-2">
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
          {/*
            帯のスロットは高さを固定する。帯の中身はフェーズごとに違い、実測で
            選択フェーズ54px・結果フェーズ44pxと10px差がある。素で並べるとその差が
            そのまま下の盤面に伝わり、フェーズが変わるたびに相手ステータスが10px動く。
            枠の役目は盤面の位置を固定することなので、ここで吸収する。

            54px は選択フェーズの帯（HandSelection の「行動を選択してください」）の実寸で、
            py-4 の32px ＋ text-sm 1行の20px ＋ 上下のborder 2px。min-h なので
            これより高い帯を入れると伸びて、また盤面が動く。帯の中身を変えるときは
            両フェーズの高さを実測して、ここに収まっているか確かめること
            （h-[54px] で固定しないのは、あふれた帯を無言で切り取らないため）。
          */}
          <div className="flex min-h-[54px] flex-col justify-center">{statusBand}</div>
        </div>

        {/* ここから盤面。相手が上、中身を挟んで自分が下 */}
        <StatusPanel
          role="opponent"
          state={opponent.state}
          hpBefore={opponent.hpBefore}
          maxHp={maxHp}
          damageFlashDelayClass={damageFlashDelayClass}
        />
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
