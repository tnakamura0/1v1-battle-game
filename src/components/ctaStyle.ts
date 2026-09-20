/**
 * 画面の主導線になるボタン（Link / button）の体裁。**CTAはすべてここを通す。**
 *
 * primary は「その画面で次にやってほしいこと」、secondary は「代わりの選択肢」。
 * **行き先の違う primary を2つ並べないこと。** どちらを押せばいいか分からなくなる。
 * Home は Hero とラストで primary を2回使っているが、どちらも行き先は /preset で、
 * 長いLPの上下から同じ出口に入れるためのものなので、これには当たらない。
 *
 * ## なぜ3層に分けたか
 *
 * かつては同じ体裁のCTAが5画面・9箇所に、7本のクラス文字列で書かれていた。ここの共有
 * 定数を使っていたのは4箇所（Home / NotFound）だけで、残る5箇所は3画面にそれぞれ
 * 直書きされていた。コピーで育った結果、secondary にカーソルを乗せたとき文字が明るく
 * なるのが一部だけ、というずれが実際に起きていた（Issue #157）。
 * **土台・トーン・サイズに分け、ctaClass が必ず3つを組み立てる形にして、土台を
 * 書き忘れる余地をなくした**（Issue #159）。
 *
 * **3つの定数を export しないこと。** 外に出すと呼び出し側で好きに組み替えられ、
 * 土台を忘れる余地が戻る。統一した意味が薄れるので、入口は ctaClass だけにしてある。
 * test/ctaSingleSource.test.ts が、CTAの体裁がこのファイルの外に現れないことを見ている。
 *
 * ## どこまでを持つか
 *
 * サイズが持つのは**ボタン自身の大きさの決まり方**（高さ・文字サイズ・幅の振る舞い）まで。
 * **画面のどこに置くか**（余白、lg以上での最大幅）は呼び出し側が持つ。実例は PresetSelect で、
 * サイズは BattleResult と同じ fill を使い、左右の余白と幅の固定、親の中で縮まないように
 * する指定は呼び出し側で足している。ここに画面固有の余白を持ち込まないこと。
 *
 * spread が幅の指定を内側に持っているのは、「モバイルで全幅・sm以上で行を等分」が
 * 一続きの**大きさの決まり方**だから。PresetSelect が呼び出し側で縮小を止めているのとは
 * 別の話で、あちらは親のレイアウト事情。
 *
 * ## 値そのものについて
 *
 * **hug と fill の高さは52pxで、タップ目標の下限44pxより上に取ってある。**
 * spread はモバイルだけ56pxだが、これは Rules が元から持っていた値。
 * **同じく2つ縦に積む BattleResult は52pxのままなので、「縦積みだから高い」という
 * 規則ではない。** 揃えるかどうかは見た目の判断が要るので、やるなら別Issueで。
 *
 * touch-manipulation はモバイルのダブルタップ拡大による遅延を切るためのもの。
 * 高さもこれも指で押される前提の値なので、小さくしないこと。
 *
 * フォーカスリングにオフセットを付けているのは、背景が暗く、隙間がないと
 * リングが要素の枠線と混ざって見えなくなるため。
 */

/** CTAである、ということだけを表す。トーンにもサイズにも依存しない */
const CTA_BASE =
  'flex touch-manipulation items-center justify-center rounded-xl font-sans font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page'

export type CtaTone = 'primary' | 'secondary'

const CTA_TONE: Record<CtaTone, string> = {
  primary: 'bg-accent text-bg-page hover:bg-accent-hover',
  secondary:
    'border border-border-emphasis text-text-secondary hover:border-accent hover:text-text-primary',
}

export type CtaSize = 'hug' | 'spread' | 'fill'

/**
 * 幅の決まり方で3種類。**高さと文字サイズも幅に連動する**ので、まとめて持っている。
 *
 * サイズを増やす前に、既存の3つで足りないかを確かめること。呼び出し側の
 * レイアウト（親のflex方向やgap）で吸収できることが多い。
 */
const CTA_SIZE: Record<CtaSize, string> = {
  /** 内容ぶんの幅。左右のpaddingを自分で持つ。親が広げれば全幅にもなる（Home のHero） */
  hug: 'h-13 px-8 text-sm',
  /** モバイルは全幅で大きめ、sm以上は横並びの行を等分。Rules の末尾に2つ並ぶ場合 */
  spread: 'h-14 w-full flex-none text-base sm:h-13 sm:w-auto sm:flex-1 sm:text-sm',
  /** 幅もpaddingも持たない。親が広げる。BattleResult の縦積み、PresetSelect の主ボタン */
  fill: 'h-13 text-sm',
}

/**
 * CTAのクラス文字列を組み立てる。**CTAを置くときは必ずこれを使うこと。**
 *
 * 画面固有の余白や配置が要る場合は、返り値の後ろに足す。
 * 例: `${ctaClass('primary', 'fill')} mx-6 lg:w-80`
 *
 * **size を省くと hug になり、左右にpaddingが付く。** fill のつもりで省かないこと。
 */
export function ctaClass(tone: CtaTone, size: CtaSize = 'hug'): string {
  return `${CTA_BASE} ${CTA_TONE[tone]} ${CTA_SIZE[size]}`
}
