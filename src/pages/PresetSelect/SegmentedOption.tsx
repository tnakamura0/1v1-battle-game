interface SegmentedOptionProps {
  name: string
  value: string
  label: string
  checked: boolean
  onChange: () => void
}

/*
 * cursor-pointer をここだけ個別に書いているのは、これが button ではなく
 * label の中の span だから。button には index.css がまとめて当てているが、
 * label は常に操作要素とは限らないので一括では当てていない（index.css の理由を参照）。
 * cursor は継承されるので label 側に書いても同じように効くが、実際に面を持ち
 * カーソルが当たるのはこの span なので、対応が分かるようこちらに置いている。
 */
const OPTION_BASE =
  'flex min-h-11 cursor-pointer touch-manipulation items-center justify-center rounded-[10px] border font-sans text-sm font-semibold transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-page'

/*
 * 未選択のホバーは ActionButton と同じ accent/60（components/ActionButton.tsx を参照）。
 * 平常時の accent が「選んである」ことを表すので、ホバーはそれより薄くして
 * 「選べる」に留める。
 * ActionButton は選択中にホバーを持たないが、ここでは持たせる。2〜3個が横に並ぶので、
 * 選択中の1個だけ無反応だと押せない要素に見えてしまうため。選択中は平常時が既に accent
 * なので、薄くする方向は使えず accent-hover（明るい側）へ動かす。
 */
const OPTION_CHECKED =
  'border-accent bg-bg-surface-active text-text-primary hover:border-accent-hover'
const OPTION_UNCHECKED =
  'border-border-default bg-bg-card text-text-secondary hover:border-accent/60 hover:bg-bg-surface hover:text-text-primary'

export function SegmentedOption({ name, value, label, checked, onChange }: SegmentedOptionProps) {
  /*
   * 見た目は peer-checked: ではなく checked プロパティで切り替える。
   * hover: と peer-checked: を混ぜると、同じプロパティ（枠線・面）を
   * どちらが上書きするかが Tailwind の variant の並び順に委ねられ、壊れやすい。
   * checked は元から渡ってきているので、クラス文字列をここで選べばこの問題は起きない。
   * peer クラスと peer-focus-visible: は input の状態にしか依存しないのでそのまま残す。
   */
  return (
    <label className="flex-1">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className={`${OPTION_BASE} ${checked ? OPTION_CHECKED : OPTION_UNCHECKED}`}>
        {label}
      </span>
    </label>
  )
}
