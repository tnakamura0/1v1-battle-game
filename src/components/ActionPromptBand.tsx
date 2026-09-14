/**
 * 選択フェーズの「行動を選択してください」の帯。
 *
 * 対戦画面（HandSelection）とLPのプレビュー（BattlePreview）が共有する。
 * 以前はプレビュー側が同じマークアップを手で複製しており、文言・余白・文字サイズを
 * 変えると片方だけ取り残される状態だった（Issue #117）。
 *
 * **この帯の高さ 54px（py-4 の32px ＋ text-sm 1行の20px ＋ 上下のborder 2px）が、
 * BattleFrame のスロットの min-h-[54px] の根拠になっている。** 余白や文字サイズを
 * 変えるとスロットからはみ出し、その分だけ下の相手ステータスがずれて
 * 結果フェーズと食い違う。変えるときは両フェーズの高さを実測すること。
 *
 * 登場演出はここに持たせず、className で外から足す。プレビューは飾りなので
 * 動かしたくない一方、対戦画面では毎ターン「自分の番が来た」ことを伝えたい、と
 * 必要が逆になるため（配置を外から渡す ActionButton の className と同じ考え方）。
 *
 * aria-live をここに置いたままプレビューでも使えるのは、プレビュー全体が inert で
 * アクセシビリティツリーから外れており、ライブリージョンが二重に登録されないため
 * （BattlePreview の PreviewFrame を参照）。
 * なお polite は「描画後に中身が変わったとき」に読み上げるものなので、
 * 仮に inert が無くても静的なプレビューが即座に読み上げられるわけではない。
 */
interface ActionPromptBandProps {
  /** 登場演出などを外から足すためのクラス（対戦画面は animate-fade-rise を渡す） */
  className?: string
}

export function ActionPromptBand({ className = '' }: ActionPromptBandProps) {
  return (
    <div
      className={`flex-none rounded-chip border border-accent/25 bg-accent/10 px-3 py-4 text-center font-sans text-sm font-semibold text-accent-light ${className}`}
      aria-live="polite"
    >
      行動を選択してください
    </div>
  )
}
