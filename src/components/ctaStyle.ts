/**
 * Home と NotFound の主導線になるボタン（Link）の体裁。
 *
 * primary は「その画面で次にやってほしいこと」、secondary は「代わりの選択肢」。
 * **行き先の違う primary を2つ並べないこと。** どちらを押せばいいか分からなくなる。
 * Home は Hero とラストで primary を2回使っているが、どちらも行き先は /preset で、
 * 長いLPの上下から同じ出口に入れるためのものなので、これには当たらない。
 *
 * Home の3箇所と NotFound から参照するため、この2つを変えるときの変更点が
 * 1箇所で済むようここにまとめている。secondary は今のところ Home だけだが、
 * primary と対にして見た目を決めるものなので一緒に置いている。
 *
 * **Rules / BattleResult / PresetSelect にも似たCTAがあるが、ここには寄せていない。**
 * Rules は高さがレスポンシブ（h-14 sm:h-13）、BattleResult は横padding を持たない
 * 全幅の button、PresetSelect は左右に余白を取って lg以上で幅を固定する。
 * 揃えるには見た目の判断が要る。まとめるなら別Issueで。
 *
 * **ただしホバーの挙動だけは3箇所で揃えてある（Issue #157）。** 寄せていない結果、
 * secondary にカーソルを乗せたとき文字が明るくなるのがここだけ、という状態に
 * なっていた。test/ctaHover.test.ts で固定しているので、片方だけ変えると落ちる。
 *
 * **h-13 は高さ52pxで、タップ目標の下限44pxより上に取ってある。**
 * touch-manipulation はモバイルのダブルタップ拡大による遅延を切るためのもの。
 * どちらも指で押される前提の値なので、小さくしないこと。
 *
 * フォーカスリングにオフセットを付けているのは、背景が暗く、隙間がないと
 * リングが要素の枠線と混ざって見えなくなるため。
 */
export const PRIMARY_CTA_CLASS =
  'flex h-13 touch-manipulation items-center justify-center rounded-xl bg-accent px-8 font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page'

export const SECONDARY_CTA_CLASS =
  'flex h-13 touch-manipulation items-center justify-center rounded-xl border border-border-emphasis px-8 font-sans text-sm font-bold text-text-secondary transition-colors hover:border-accent hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page'
