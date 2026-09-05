interface SegmentedOptionProps {
  name: string
  value: string
  label: string
  checked: boolean
  onChange: () => void
}

export function SegmentedOption({ name, value, label, checked, onChange }: SegmentedOptionProps) {
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
      <span className="flex min-h-11 touch-manipulation items-center justify-center rounded-[10px] border border-border-default bg-bg-card font-sans text-sm font-semibold text-text-secondary transition-colors peer-checked:border-accent peer-checked:bg-bg-surface-active peer-checked:text-text-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-page">
        {label}
      </span>
    </label>
  )
}
