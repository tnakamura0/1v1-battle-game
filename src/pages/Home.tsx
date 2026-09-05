import { Link } from 'react-router'

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
    title: '制限時間なし',
    description: 'じっくり考えて選択できる、落ち着いたターン制バトル。',
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
        <span className="font-mono text-xs font-bold tracking-[0.14em] text-text-secondary">
          1v1 BATTLE
        </span>
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
          チャージ・攻撃・ガードの3択でCPUと駆け引きする、フロントエンド完結のシンプル対戦ゲーム。
        </p>
        <Link
          to="/preset"
          className="mt-2 flex h-13 touch-manipulation items-center justify-center rounded-xl bg-accent px-8 font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
        >
          対戦を始める
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-2 rounded-card border border-border-default bg-bg-card p-5 shadow-card"
          >
            <span className="font-sans text-sm font-extrabold text-text-primary">
              {feature.title}
            </span>
            <p className="font-sans text-xs leading-relaxed text-text-secondary">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-sans text-lg font-bold text-text-primary">遊び方</h2>
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
