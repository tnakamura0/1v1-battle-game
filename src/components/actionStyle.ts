import type { Action } from '@/game/types'

/**
 * 行動の色。「何を選んだか」を表す軸で、対戦者の識別色（components/roleStyle.ts の
 * player / opponent）とは独立している。混ぜないこと。
 *
 * 5箇所（ActionButton / TurnResult / TurnHistoryList / Rules / ActionShowcase）が
 * それぞれ同じ対応表を持っていたので、配色を変えるときの変更点が1箇所で済むよう
 * ここにまとめている。
 *
 * 次の2つは値が同じでも軸が違うので、ここには寄せない。専用のトークンが
 * index.css にあるので、そちらを使うこと（--color-damage / --color-energy）。
 * - ダメージの色（HPが減ったこと）。ローズだが「攻撃を選んだ」という意味ではない
 * - エネルギー量の色（StatusPanel のドット）。琥珀だが「チャージを選んだ」わけではない
 *
 * かつては呼び出し側で text-attack / bg-charge と直接書いており、この使い分けは
 * コメントにしか存在しなかった。行動色を集約した経緯（Issue #74）だけを見て
 * ACTION_STYLE に寄せられてしまう余地があったため、トークンに名前を付けて
 * コード側でも区別が分かるようにした（Issue #80）。
 * 合わせて、このファイル以外で text-attack / bg-charge 等を直接書くと
 * lint エラーになるようにしている（eslint.config.js の no-restricted-syntax）。
 */
export const ACTION_STYLE: Record<
  Action,
  {
    /** アイコンと行動名テキストの色 */
    textClass: string
    /** アウトラインのバッジ。面は塗らず、枠線と文字だけで色を出す */
    badgeClass: string
  }
> = {
  charge: {
    textClass: 'text-charge',
    badgeClass: 'border-charge/35 text-charge',
  },
  attack: {
    textClass: 'text-attack',
    badgeClass: 'border-attack/35 text-attack',
  },
  guard: {
    textClass: 'text-guard',
    badgeClass: 'border-guard/35 text-guard',
  },
}

/**
 * 3つの行動を並べるときの順序。HandSelection の行動ボタン、Rules の行動カードと
 * 組み合わせ表の行・列、LPの ActionShowcase——すべてこの順で揃える。
 * 共有される定数なので、呼び出し側から並べ替えられないよう readonly にしている。
 *
 * 行動ボタンは横一列ではなく三角形に並ぶ（components/ActionTriangle.tsx）が、
 * 変わったのは並べ方だけで順序はこのまま。三角形でも
 * 上段中央 → 下段左 → 下段右 がこの順に対応する。
 */
export const ACTION_ORDER: readonly Action[] = ['charge', 'attack', 'guard'] as const
