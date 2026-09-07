import { Link } from 'react-router'
import { SectionHeading } from '@/components/SectionHeading'

const FEATURES = [
  {
    title: '3つの行動',
    description: 'チャージ・攻撃・ガードから毎ターン1つを選ぶ、シンプルな読み合い。',
  },
  {
    title: '相手を読む',
    description: 'エネルギーとガードの状態から、相手の次の一手を予測する。',
  },
  {
    title: '紙一重の攻防',
    description: '初期HPはわずか2〜3。一手のミスが命取りになる、最後まで気の抜けない緊張感。',
  },
]

const STEPS = [
  'プリセットから対戦ルールを選ぶ',
  '毎ターン、行動を1つ選択する',
  '結果を確認し、次のターンへ',
  '相手のHPを0にすれば勝利',
]

export function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-16 p-6 pb-20">
      <header className="flex items-center justify-between pt-4">
        <AppLogo />
        <Link
          to="/rules"
          className="flex h-9 items-center justify-center rounded-pill border border-border-default px-4 font-sans text-sm font-semibold text-text-secondary transition-colors hover:border-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
        >
          ルール
        </Link>
      </header>

      <section className="flex flex-col items-start gap-5">
        <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-accent">
          VS CPU
        </span>
        <h1 className="font-sans text-4xl font-extrabold leading-tight text-text-primary text-balance">
          読み合いの1対1バトル
        </h1>
        <p className="max-w-md font-sans text-sm leading-relaxed text-text-secondary">
          登録不要、CPU相手にいつでも気軽に対戦できる。チャージ・攻撃・ガードの3択で駆け引きするシンプル対戦ゲーム。
        </p>
        <Link
          to="/preset"
          className="mt-2 flex h-13 touch-manipulation items-center justify-center rounded-xl bg-accent px-8 font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
        >
          対戦を始める
        </Link>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading title="ゲームの魅力" />
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="flex flex-col gap-2 rounded-card border border-border-default bg-bg-card p-5 shadow-card"
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-accent">
                0{index + 1}
              </span>
              <span className="font-sans text-sm font-extrabold text-text-primary">
                {feature.title}
              </span>
              <p className="font-sans text-xs leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading title="遊び方" />
        <ol className="grid gap-3 sm:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="flex flex-col gap-1.5 rounded-chip border border-border-default bg-bg-row p-4"
            >
              <span className="font-mono text-[10px] font-bold text-accent">STEP{index + 1}</span>
              <span className="font-sans text-xs text-text-secondary">{step}</span>
            </li>
          ))}
        </ol>
        <Link
          to="/rules"
          className="inline-flex w-fit items-center gap-1.5 self-center font-sans text-sm font-semibold text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
        >
          くわしいルールを見る
          <span aria-hidden>→</span>
        </Link>
      </section>

      <footer className="mt-8 flex justify-center">
        <Link
          to="/preset"
          className="flex h-13 touch-manipulation items-center justify-center rounded-xl bg-accent px-10 font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
        >
          対戦を始める
        </Link>
      </footer>
    </main>
  )
}

function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden>
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
      <span className="flex items-baseline gap-[0.2em] font-sans text-2xl font-extrabold tracking-[-0.01em]">
        <span className="text-text-primary">OUTWIT</span>
        <span className="text-accent">DUEL</span>
      </span>
    </div>
  )
}
