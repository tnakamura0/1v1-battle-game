interface SegmentedOptionProps {
  name: string
  value: string
  label: string
  checked: boolean
  onChange: () => void
}

const OPTION_BASE =
  'flex min-h-11 cursor-pointer touch-manipulation items-center justify-center rounded-[10px] border font-sans text-sm font-semibold transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-page'

/*
 * ホバーは ActionButton と同じ使い分けにする（components/ActionButton.tsx を参照）。
 * 未選択は accent/60 で「選べる」ことを、選択中は accent で「選んである」ことを表し、
 * 濃さで両者を区別する。選択中にもホバーを付けるのは、反応がないと
 * 「押しても何も起きない要素」に見えてしまうため。
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
