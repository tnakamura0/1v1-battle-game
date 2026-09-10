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
  /**
   * center = 常に中央寄せ。LPのセクションはこちらが基本なので既定値にしている。
   * split  = モバイルは中央寄せ、sm以上で左寄せ。横に図版を並べる2カラムのセクション用。
   *
   * 「左寄せ」ではなく「2カラムのとき」という意図で名前を付けているのは、
   * 正解がブレークポイントによって変わるため。見た目の値で持たせると、
   * モバイルでも左に寄ったままになる（Issue #75 がまさにそれ）。
   * 「全幅で常に左寄せ」が要るようになったら split を流用せず 'start' を足すこと。
   */
  align?: 'center' | 'split'
}

export function SectionIntro({ meta, title, description, align = 'center' }: SectionIntroProps) {
  const split = align === 'split'
  return (
    <div
      className={`flex flex-col items-center gap-2 text-center ${split ? 'sm:items-start sm:text-left' : ''}`}
    >
      <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-accent">{meta}</span>
      <h2 className="font-sans text-2xl font-extrabold leading-tight text-text-primary text-balance sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p
          className={`max-w-lg font-sans text-sm leading-relaxed text-text-secondary ${split ? 'sm:max-w-md' : ''}`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
