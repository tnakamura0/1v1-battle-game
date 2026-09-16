/**
 * 対戦画面の演出の「段取り」。何をどの動きで出すかは各コンポーネントが書き、
 * ここが持つのは**いつ出すか**（遅延）だけ。ActionStyle / ROLE_STYLE と同じく、
 * 決定を1箇所に集めて、段取りを変えるときの変更点をここだけにするためのもの。
 *
 * 動きそのもの（--animate-* と @keyframes）は index.css にある。
 *
 * ## この実装の不変条件：アニメーションは要素を出し入れしない
 *
 * 段階表示は setTimeout で要素を順にマウントしても作れるが、その方式は採っていない。
 * DOMは最初から全部あり、animation-delay と fill-mode: both で「見えていないだけ」に
 * している。つまり:
 *
 * - stateもタイマーも増えない（battleReducer は演出を一切知らない）
 * - Testing Library からは最初から全部引ける。CSSを評価しない jsdom では
 *   そもそもアニメーションが存在しないのと同じ
 *
 * **要素の出し入れやJSタイマーによる段階表示を足さないこと。** 足した瞬間に
 * 「既存テストが素通りする＝何も壊していない」という保証が消える。
 *
 * ## 遅延はリテラル文字列で書くこと
 *
 * Tailwind v4 はソースを文字列として走査してクラスを生成する。
 * `[animation-delay:${ms}ms]` のように実行時に組み立てると、走査に引っかからず
 * クラスが生成されない（型は通り、lintも通り、ブラウザでだけ効かない）。
 * 下の定数がすべて生の文字列なのはそのため。計算で作らないこと。
 */

/**
 * 手の結果（pages/Battle/TurnResult.tsx）の段取り。
 *
 * まず場の状況（ステータス・TURN）と左右から入る行動カードが**同時に**出る。
 * この2つは遅延0なので、ここには定数を持たない。そのあと ぶつかった（impact）→
 * どうなった（headline）→ 何が変わったか（CHANGE_ROW_DELAY）と続く。
 */
export const REVEAL_DELAY = {
  /** 行動カードの間のVS。ぶつかった瞬間 */
  impact: '[animation-delay:240ms]',
  /**
   * 結果の見出し。失ったHPセルの damage-flash もこの値を使う
   * （TurnResult が StatusPanel の damageFlashDelayClass に渡す）
   */
  headline: '[animation-delay:440ms]',
} as const

/**
 * 変化行（相手HP・自分HP・自分EN・相手EN・自分ガード）を順に出すための遅延。
 * 640ms から 80ms ずつ。見出し（440ms開始・380ms）の再生中に重ねて始まる。
 * 見出しが完全に出終わるのを待つと、演出が間延びして読む時間を削ってしまう。
 *
 * 配列のリテラルなのは上記のTailwindの制約による。長さ5は
 * TurnResult の buildChangeRows が持つ分岐の数と一致しており、それが上限。
 * 分岐を増やすときはここも足すこと（足りなければ最後の値で頭打ちにしている）。
 */
export const CHANGE_ROW_DELAY = [
  '[animation-delay:640ms]',
  '[animation-delay:720ms]',
  '[animation-delay:800ms]',
  '[animation-delay:880ms]',
  '[animation-delay:960ms]',
] as const

/**
 * 対戦開始（pages/Battle/BattleIntro.tsx）の段取り。
 *
 * 先頭はカウントダウン（対戦中の「状態の帯」と同じく画面内の一番上に置く。Issue #124）で、
 * 遅延0なのでここには定数を持たない。そのあと 対峙（versus）→ 設定（preset）と続く。
 */
export const INTRO_DELAY = {
  versus: '[animation-delay:80ms]',
  preset: '[animation-delay:220ms]',
} as const

/**
 * 最終結果画面（pages/BattleResult/BattleResult.tsx）の段取り。
 * 成績行は50ms刻みで、行は4つ（ルール・最終HP自分・最終HP相手・ターン数）で固定。
 *
 * **actions を480msより後ろにしないこと。** この画面の主目的は
 * 「もう一度対戦する」ボタンで、それが見えるまでの時間を伸ばすことになる。
 * 成績行の最後より後ろに置いて、上から順に出るようにしている。
 *
 * Issue #131 で「ルール」の行を足して3行→4行になった。刻みを70ms→50msに詰めて、
 * 最後の行を430msに収めている。元の70ms刻みのまま1行足すと490msとなり、
 * actions の480msを追い越して上記の制約を破る。さらに行を増やすなら、
 * 後ろに足すのではなく刻みをもう一段詰めること。
 */
export const RESULT_DELAY = {
  headline: '[animation-delay:120ms]',
  stats: [
    '[animation-delay:280ms]',
    '[animation-delay:330ms]',
    '[animation-delay:380ms]',
    '[animation-delay:430ms]',
  ],
  actions: '[animation-delay:480ms]',
} as const
