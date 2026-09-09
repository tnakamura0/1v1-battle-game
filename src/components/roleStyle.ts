/**
 * 対戦者の識別色。「誰の情報か」を表す軸で、行動色（チャージ・攻撃・ガード）とは独立している。
 *
 * 識別色は原則として「領域」で示す。カードなど面のある要素は背景のティントと
 * 枠線（surfaceClass）で、行のように面を塗ると重くなる要素は左端の帯（edgeClass）で
 * 示し、文字そのものには色を付けない。文字に色を付けて回ると、行動色やダメージ色と
 * 混ざって画面の色数が増え、散らかった印象になるため。
 * 例外はステータスパネルのラベル（YOU / OPPONENT）だけで、ここは画面内で持ち主を
 * 判断する基準点になるため textClass で色を残している。
 *
 * 自分の色は既存のaccent／guardと同じシアンで、値としては重複している。
 * ガードを選んだターンは面とアイコンが同系色になるが、識別色は常に
 * YOU / OPPONENT や「自分」「相手」という文字と一緒に出るため、色だけで
 * 意味が決まる場面はない。アプリの基調色をそのまま自分の色に使うほうが
 * 画面全体としてまとまるので、あえて別のシアンにはしていない。
 *
 * 4画面（BattleIntro / StatusPanel / TurnResult / BattleResult）から参照するため、
 * 配色を変えるときの変更点が1箇所で済むようここにまとめている。
 */
export type BattleRole = 'player' | 'opponent'

export const ROLE_STYLE: Record<
  BattleRole,
  {
    label: string
    /** ラベルの文字色。基準点になるステータスパネルのラベルにだけ使う */
    textClass: string
    /** HPバーの埋まったセル */
    hpCellClass: string
    /** 領域のティント（背景＋枠線）。border と組み合わせて使う */
    surfaceClass: string
    /** 行の左端の帯の色。border-l-[3px] と組み合わせて使う */
    edgeClass: string
  }
> = {
  player: {
    label: 'YOU',
    textClass: 'text-player',
    hpCellClass: 'bg-player',
    surfaceClass: 'border-player/30 bg-player/10',
    edgeClass: 'border-l-player',
  },
  opponent: {
    label: 'OPPONENT',
    textClass: 'text-opponent',
    hpCellClass: 'bg-opponent',
    surfaceClass: 'border-opponent/30 bg-opponent/10',
    edgeClass: 'border-l-opponent',
  },
}
