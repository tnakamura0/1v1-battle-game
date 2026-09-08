/**
 * 対戦者の識別色。「誰の情報か」を表す軸で、行動色（チャージ・攻撃・ガード）とは独立している。
 *
 * 自分の色は既存のaccent／guardと同じシアンで、値としては重複している。
 * ガードを選んだターンはラベルとアイコンが同系色になるが、識別色は常に
 * YOU / OPPONENT や「自分」「相手」という文字と一緒に出るため、色だけで
 * 意味が決まる場面はない。アプリの基調色をそのまま自分の色に使うほうが
 * 画面全体としてまとまるので、あえて別のシアンにはしていない。
 *
 * 3画面（StatusPanel / TurnResult / BattleResult）から参照するため、
 * 配色を変えるときの変更点が1箇所で済むようここにまとめている。
 */
export type BattleRole = 'player' | 'opponent'

export const ROLE_STYLE: Record<
  BattleRole,
  { label: string; textClass: string; hpCellClass: string; edgeClass: string }
> = {
  player: {
    label: 'YOU',
    textClass: 'text-player',
    hpCellClass: 'bg-player',
    edgeClass: 'border-l-player',
  },
  opponent: {
    label: 'OPPONENT',
    textClass: 'text-opponent',
    hpCellClass: 'bg-opponent',
    edgeClass: 'border-l-opponent',
  },
}
