import { CURTAIN_DELAY } from '@/components/motion'

/**
 * 火花。中心から外へ飛ぶ光の筋を12本、向きと長さをわざと不揃いにして並べる。
 * 向きは火花の親に当てる rotate、長さと飛ぶ距離は同じ親の scale で決め、
 * 火花自身は「上へ飛ぶ」動き（result-spark）だけを持つ。
 *
 * 揃えないのは、等間隔・同じ長さにすると光輪と合わせて時計の文字盤や照準に見えたため
 * （真上・真横に筋が来るのが特に効くので、そこは避けている）。値そのものに意味はない。
 */
const SPARKS = [
  { angle: 15, scale: 1 },
  { angle: 41, scale: 0.65 },
  { angle: 72, scale: 0.85 },
  { angle: 104, scale: 0.7 },
  { angle: 133, scale: 1 },
  { angle: 160, scale: 0.6 },
  { angle: 197, scale: 0.9 },
  { angle: 226, scale: 0.7 },
  { angle: 250, scale: 1 },
  { angle: 287, scale: 0.65 },
  { angle: 314, scale: 0.85 },
  { angle: 340, scale: 0.75 },
] as const

/**
 * 最終結果画面の冒頭に重ねる幕（Issue #162）。画面全体を覆って「勝利」「敗北」を大きく出し、
 * 約1.4秒で消える。段取りは components/motion.ts の CURTAIN_DELAY、動きは index.css にある。
 *
 * 勝ったときは文字が叩きつけられ、光輪と火花が広がる。負けたときは文字が上から沈んで
 * 小さく揺れるだけで、光輪も火花も出さない。
 *
 * ## 出し入れしない
 *
 * 対戦画面の段階表示と同じく、幕は最初から最後までDOMにあり、CSSアニメーションだけで
 * 見えなくなる（motion.ts の不変条件）。消えたあとは visibility: hidden になり、
 * 当たり判定からも外れる（index.css の curtain-fade / curtain-hide）。
 *
 * ## タップを受け止める
 *
 * 幕が出ている間のタップは、下の見えていないボタンに届かないよう幕で受け止める。
 * 受け止めるのは指とマウスだけで、キーボードのフォーカスは止めていない。Tab で
 * 見えていないボタンに移って押すことはできる。止めるには inert（state が要る）か、
 * ボタン側を visibility で隠すしかなく、後者はスクリーンリーダーからもボタンを消してしまう。
 * ページ遷移の直後はフォーカスが body にあり、押すまでにキーを2回要するので、そのままにしている。
 *
 * ## 読み上げない
 *
 * aria-hidden にしている。勝敗は BattleResult の見出し（h1）が伝えるので、
 * ここまで読ませると同じことを二度聞かされる。見出しの要素にしないのも同じ理由。
 */
export function ResultCurtain({ won }: { won: boolean }) {
  return (
    <div
      aria-hidden="true"
      /*
        invisible が素の状態で、見えているのはアニメーションが visible にしている間だけ
        （index.css の curtain-hide）。アニメーションが走らない環境（拡張機能やユーザースタイルで
        animation を切っているなど）では、幕は最初から出ず、画面はそのまま押せる。
        素を見える状態にすると、同じ環境で全画面の幕が消えずに残り、結果画面が一切押せなくなる。

        動きを嫌う設定のときは、motion-reduce:hidden で幕そのものを出さない。
        index.css の一括の規則だけでも幕は一瞬で消えるが、最初の1フレームは幕が描かれうる。
        全画面の暗転と大きな文字が一瞬だけ光るのは、動きを止めたい人にとってむしろ悪い。

        z-10 は外さないこと。幕はDOMの先頭にあり、後ろに続く画面本体の要素は
        アニメーションの transform で重なりの層を作る。z-index がないとそちらが幕より手前に来て、
        幕の上に透けて見え、タップも幕を素通りしてボタンに届く。
        fixed で画面全体を覆えるのは、祖先（main / #root / body）に transform・filter・
        will-change・contain が付いていないから。付けると幕はその祖先の中に閉じ込められる。

        受け止めたタップが何も起こさないよう、select-none で長押しの文字選択を、
        touch-manipulation で連打によるダブルタップ拡大を止めている。

        pointer-events-none を付けていないのはわざと（index.css の curtain-fade / curtain-hide を参照）。
      */
      className={`animate-curtain-out ${CURTAIN_DELAY.out} invisible fixed inset-0 z-10 flex touch-manipulation select-none items-center justify-center overflow-hidden bg-bg-page motion-reduce:hidden`}
    >
      {/*
        光の帯。画面の外から外へ抜ける。
        線形のグラデーションだと帯の上下の縁がくっきり出るので、楕円の放射状にしている。

        幕の overflow-hidden は保険。帯も、勝ったときの光輪も、最後は画面幅を超える。
        fixed の要素のはみ出しは Chrome ではページの横スクロールを生まない（実測）が、
        ほかのエンジンまでは確かめていないので、幕の中で切っている。
      */}
      <div className="absolute inset-0 flex items-center">
        <div
          className={`animate-result-sweep h-40 w-full bg-radial to-transparent to-70% ${won ? 'from-accent/25' : 'from-lose/20'}`}
        />
      </div>

      {/*
        光輪と火花は top/left を指定しない absolute にしている。フレックスコンテナの
        absolute な子は、ほかに子がいないものとして justify / items で配置されるので、
        これだけで画面の中央、つまり文字の真後ろに来る。
      */}
      {won && (
        <>
          <div
            className={`animate-result-ring ${CURTAIN_DELAY.burst} absolute size-40 rounded-full border-2 border-accent`}
          />
          {SPARKS.map(({ angle, scale }) => (
            <div
              key={angle}
              className="absolute"
              style={{ transform: `rotate(${angle}deg) scale(${scale})` }}
            >
              <div
                className={`animate-result-spark ${CURTAIN_DELAY.burst} h-3.5 w-0.5 rounded-full bg-accent-light`}
              />
            </div>
          ))}
        </>
      )}

      {/*
        relative は、上の absolute な光輪と火花より手前に描かせるため。
        位置指定のない要素は、absolute な要素より奥に描かれる。

        pl-[0.2em] は字間（tracking-[0.2em]）の打ち消し。字間は最後の文字の後ろにも付くので、
        そのままだと文字が字間の半分だけ左に寄り、画面の中央にある光輪とずれる。
      */}
      <span
        className={`${won ? 'animate-result-slam text-accent-hover' : 'animate-result-sink text-lose'} ${CURTAIN_DELAY.title} relative pl-[0.2em] font-sans text-7xl font-extrabold tracking-[0.2em]`}
      >
        {won ? '勝利' : '敗北'}
      </span>
    </div>
  )
}
