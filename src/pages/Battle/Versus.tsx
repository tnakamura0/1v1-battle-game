import { ROLE_STYLE, type BattleRole } from '@/components/roleStyle'

/**
 * 「あなた ◯ VS ◯ CPU」の対峙表現。
 *
 * BattleIntro（対戦開始前）と HandSelection（行動選択中）の2箇所から使う。
 * この2つで見た目が食い違わないことを、共有そのもので担保するのが目的なので、
 * サイズや配色を差し替えるpropは持たせない。出し分けが要るように見えたときは、
 * それが本当に「同じ対峙」なのかをまず疑うこと。
 *
 * 並びは自分が左・相手が右。TurnResult の行動カードも同じ並びで、
 * 画面をまたいでどちら側が自分かが入れ替わらないようにしている。
 */
export function Versus() {
  return (
    <div className="flex items-center gap-6">
      <RoleCircle role="player" label="あなた" />
      <span className="font-mono text-xs font-bold tracking-[0.06em] text-text-tertiary">VS</span>
      <RoleCircle role="opponent" label="CPU" />
    </div>
  )
}

function RoleCircle({ role, label }: { role: BattleRole; label: string }) {
  return (
    <div
      className={`flex h-20 w-20 items-center justify-center rounded-full border ${ROLE_STYLE[role].surfaceClass} font-sans text-sm font-bold text-text-primary shadow-card`}
    >
      {label}
    </div>
  )
}
