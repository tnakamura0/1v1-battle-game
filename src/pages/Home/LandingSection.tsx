import type { ReactNode } from 'react'

/**
 * LPのセクション枠。
 *
 * LPだけは他画面と違い、背景を画面の端まで届かせる（full-bleed）。セクションごとに
 * tone を交互に切り替えることで、中央寄せ1カラムのままでは出せないリズムを作る。
 * 端まで伸びる帯と中央寄せのコンテンツを両立させるため、幅の制限は section ではなく
 * 内側のコンテナが持つ。この構造をここに閉じ込めて、各セクション側では意識させない。
 */
interface LandingSectionProps {
  /** page = ページ地のまま / sunken = 一段沈んだ面 */
  tone?: 'page' | 'sunken'
  children: ReactNode
}

export function LandingSection({ tone = 'page', children }: LandingSectionProps) {
  return (
    <section
      className={`border-t border-border-default ${tone === 'sunken' ? 'bg-bg-card' : 'bg-bg-page'}`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-14 sm:py-20">
        {children}
      </div>
    </section>
  )
}
