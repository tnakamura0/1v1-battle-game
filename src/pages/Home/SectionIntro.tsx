import type { ReactNode } from 'react'

/**
 * LPのセクション見出し。英字のメタラベル＋日本語のタイトル＋任意の説明文。
 *
 * 他画面の SectionHeading（18px＋accentの縦バー）はここでは使わない。LPは
 * 他画面より一段ビジュアル強度を上げる方針で、メタラベルを添えた大きめの見出しに
 * している。SectionHeading はルール画面が引き続き使うのでそのまま残してある。
 */
interface SectionIntroProps {
  /** JetBrains Mono の英字ラベル。セクションの性格を一目で示す */
  meta: string
  title: string
  description?: ReactNode
  align?: 'start' | 'center'
}

export function SectionIntro({ meta, title, description, align = 'start' }: SectionIntroProps) {
  const centered = align === 'center'
  return (
    <div className={`flex flex-col gap-2 ${centered ? 'items-center text-center' : 'items-start'}`}>
      <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-accent">{meta}</span>
      <h2 className="font-sans text-2xl font-extrabold leading-tight text-text-primary text-balance sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p
          className={`font-sans text-sm leading-relaxed text-text-secondary ${centered ? 'max-w-lg' : 'max-w-md'}`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
