import { ACTION_ORDER, ACTION_STYLE } from '@/components/actionStyle'
import { ActionIcon } from '@/components/ActionIcon'
import { ACTION_LABEL } from '@/game/copy'
import type { Action } from '@/game/types'

/** バッジの文言はLP固有のコピーなので、色（ACTION_STYLE）とは分けてここに置く */
const ACTION_EFFECT: Record<Action, string> = {
  charge: 'ENERGY +1',
  attack: 'ENERGY COST 1',
  guard: '攻撃を防ぐ',
}

/**
 * LPで3つの行動を見せるセクション。
 *
 * 行動色（charge=琥珀 / attack=ローズ / guard=シアン）を出す唯一の場所で、
 * ここが「LPがシアン一色で淡白」という問題への答えになっている。
 * ただし色を使うのはアイコンとバッジの輪郭だけで、面は塗らない。塗ると
 * 3枚のカードが主張しすぎて「操作は3択、それだけ」という主旨と食い違うため。
 *
 * レイアウトはPCが3カラム、モバイルが横長のリスト行。モバイルで3カラムのままだと
 * アイコンとラベルが窮屈になるので、1行1行動に組み替えている。
 */
export function ActionShowcase() {
  return (
    <ul aria-label="3つの行動" className="flex flex-col gap-3 sm:flex-row sm:gap-5">
      {ACTION_ORDER.map((action) => {
        const { textClass, badgeClass } = ACTION_STYLE[action]
        return (
          <li
            key={action}
            className="flex flex-1 items-center gap-3.5 rounded-chip border border-border-default bg-bg-page p-4 sm:flex-col sm:justify-center sm:gap-4 sm:rounded-card sm:px-6 sm:py-9"
          >
            <span className={textClass}>
              <ActionIcon action={action} size={24} strokeWidth={1.7} className="sm:h-9 sm:w-9" />
            </span>
            <span className="flex-1 font-sans text-sm font-bold text-text-primary sm:flex-none sm:text-lg">
              {ACTION_LABEL[action]}
            </span>
            <span
              className={`flex-none rounded-pill border px-2.5 py-1 font-mono text-chip font-semibold tracking-[0.04em] sm:px-3.5 sm:py-1.5 sm:text-meta ${badgeClass}`}
            >
              {ACTION_EFFECT[action]}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
