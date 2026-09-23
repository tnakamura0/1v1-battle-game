import { Link } from 'react-router'
import { ctaClass } from '@/components/ctaStyle'
import { ActionShowcase } from '@/pages/Home/ActionShowcase'
import { BattlePreview, OpponentStatusPreview } from '@/pages/Home/BattlePreview'
import { LandingSection } from '@/pages/Home/LandingSection'
import { SectionIntro } from '@/pages/Home/SectionIntro'

const STEPS = [
  '対戦ルールを設定する',
  '毎ターン、行動を1つ選択する',
  '結果を確認し、次のターンへ',
  '相手のHPを0にすれば勝利',
]

export function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border-default">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <AppLogo />
          <Link
            to="/rules"
            className="flex h-9 items-center justify-center rounded-pill border border-border-default px-4 font-sans text-sm font-semibold text-text-secondary transition-colors hover:border-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
          >
            ルール
          </Link>
        </div>
      </header>

      <Hero />

      <LandingSection tone="sunken">
        <SectionIntro meta="3 ACTIONS" title="操作は3択、それだけ" />
        <ActionShowcase />
      </LandingSection>

      <LandingSection>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-10">
          <div className="flex-1">
            <SectionIntro
              meta="READ THE ENEMY"
              title="相手を読む、という奥深さ"
              description="相手のエネルギーとガードの状態から、次の一手を予測する。初期HPはわずか1〜3。一手のミスが命取りになる。"
              align="split"
            />
          </div>
          <div className="flex flex-1 justify-center">
            <OpponentStatusPreview />
          </div>
        </div>
      </LandingSection>

      <LandingSection tone="sunken">
        <SectionIntro meta="FLOW" title="1ターンの流れ" />
        <ol className="grid gap-3 sm:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="flex items-center gap-3.5 rounded-r-chip border-l-2 border-accent bg-bg-page px-4 py-3.5 sm:flex-col sm:items-start sm:gap-2 sm:rounded-b-chip sm:rounded-l-none sm:border-l-0 sm:border-t-2 sm:px-4 sm:py-5"
            >
              {/*
                ルール画面の STEP は text-meta（11px）だが、ここは w-12 の欄に収める
                添え字なので text-chip（10px）。同じ文言でサイズが違うのは意図したもので、
                あちらは本文と並ぶ見出し、こちらは本文の左に沿える番号という別の役。
                index.css のはしごを参照。
              */}
              <span className="w-12 flex-none font-mono text-chip font-bold tracking-widest text-text-tertiary">
                STEP{index + 1}
              </span>
              <span className="font-sans text-sm font-semibold leading-snug text-text-primary">
                {step}
              </span>
            </li>
          ))}
        </ol>
        <Link
          to="/rules"
          className="inline-flex w-fit items-center gap-1.5 self-center rounded-chip font-sans text-sm font-semibold text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
        >
          くわしいルールを見る
          <span aria-hidden>→</span>
        </Link>
      </LandingSection>

      <LandingSection>
        <div className="flex flex-col items-center gap-6 text-center">
          <SectionIntro meta="READY?" title="最初の対戦を始めよう" />
          <Link to="/preset" className={ctaClass('primary')}>
            対戦を始める
          </Link>
        </div>
      </LandingSection>

      <footer className="border-t border-border-default bg-bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-7">
          <span className="font-sans text-xs font-bold text-text-tertiary">OUTWIT DUEL</span>
          <Link
            to="/rules"
            className="rounded-chip font-sans text-xs font-semibold text-text-tertiary transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
          >
            ルール / 遊び方
          </Link>
        </div>
      </footer>
    </main>
  )
}

/**
 * Heroだけは背景に薄い格子とごく淡いシアンの円を敷いて、
 * 「静かな戦術ディスプレイ」の気配だけを足している。GlowやNeonは使わない。
 */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--color-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-grid-line)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40 sm:bg-size-[64px_64px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 h-130 w-130 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.07),transparent_70%)]"
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 sm:flex-row sm:items-center sm:gap-8 sm:py-20">
        <div className="flex flex-1 flex-col items-start gap-5">
          <span className="font-mono text-meta font-bold tracking-[0.18em] text-accent">
            VS CPU
          </span>
          <h1 className="font-sans text-4xl font-extrabold leading-tight text-text-primary text-balance">
            読み合いの1対1バトル
          </h1>
          <p className="max-w-md font-sans text-sm leading-relaxed text-text-secondary">
            登録不要、CPU相手にいつでも気軽に対戦できる。チャージ・攻撃・ガードの3択で駆け引きするシンプル対戦ゲーム。
          </p>
          {/*
            sm以上でも self-stretch のままにして、行を左カラムの幅まで伸ばす（Issue #165）。
            親が items-start なので、sm:self-auto に戻すと行が内容ぶんの幅になり、
            カラムの右側だけ余白が残って見える。揃える相手は説明文（max-w-md）ではなく
            カラムの幅と決めたので、lg以上では説明文の右端より24px外に出る。

            **sm:flex-1 は2つとも必要。** 行だけ伸ばしても中身は内容ぶんの幅のままで、
            見た目が変わらない。

            **sm: を外さないこと。** モバイルは flex-col で、そこでは flex-1 の
            flex-basis:0 が縦（主軸）の指定になり、h-13 の52pxを上書きする。行に高さが
            ないので文字ぶん（約20px）まで潰れ、ctaStyle.ts が下限としているタップ目標44pxを割る。

            サイズは hug のまま。欲しいのは spread の「sm以上で行を等分」だけだが、
            spread はモバイルの高さ56px・文字16pxまで連れてくる（components/ctaStyle.ts）。
            サイズを増やす前に既存の3つで足りないかを確かめる、という同ファイルの方針に従って
            呼び出し側で足した。hug と spread の高さを揃える判断が済めば、spread に寄せられる。
          */}
          <div className="mt-2 flex flex-col gap-3 self-stretch sm:flex-row">
            <Link to="/preset" className={`${ctaClass('primary')} sm:flex-1`}>
              対戦を始める
            </Link>
            <Link to="/rules" className={`${ctaClass('secondary')} sm:flex-1`}>
              ルールを見る
            </Link>
          </div>
        </div>

        <div className="flex flex-1 justify-center sm:-rotate-3">
          <BattlePreview />
        </div>
      </div>
    </section>
  )
}

function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden>
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="11"
          className="fill-bg-card stroke-border-default"
        />
        <path d="M14 34 L19 33 L34 14 L15 29 Z" fill="#3A4B5E" />
        <path
          d="M12 32 L16 36 M14 34 L10 38"
          fill="none"
          stroke="#5F7488"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M34 34 L29 33 L14 14 L33 29 Z" className="fill-accent" />
        <path
          d="M32 36 L36 32 M34 34 L38 38"
          fill="none"
          stroke="#5F7488"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex items-baseline gap-[0.2em] font-sans text-xl font-extrabold tracking-[-0.01em] sm:text-2xl">
        <span className="text-text-primary">OUTWIT</span>
        <span className="text-accent">DUEL</span>
      </span>
    </div>
  )
}
