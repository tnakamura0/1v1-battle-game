import { ActionButton, type ActionButtonStatus } from '@/components/ActionButton'
import { ACTION_ORDER } from '@/components/actionStyle'
import type { Action } from '@/game/types'

interface ActionTriangleProps {
  /**
   * 行動ごとの状態と、押せないときの理由の文言。
   * 省略するとすべて idle になる（LPのプレビューのように、飾りとして並べるだけの用途）。
   */
  stateOf?: (action: Action) => { status: ActionButtonStatus; reasonLabel?: string }
  onSelect: (action: Action) => void
}

const ACTION_CELL: Record<Action, string> = {
  /*
   * 4列にして3つとも2列分を占めることで、gap を挟んでも幅が自動的に揃い、
   * チャージがちょうど中央に来る。2列グリッドで幅を calc(50% - gap/2) と書く手もあるが、
   * それだと gap の値を計算式に埋め込むことになり、gap を変えたときに崩れる。
   *
   * 行は自動配置に任せず row-start で明示する。col-start だけでも結果は同じだが、
   * 「なぜ2段になるのか」が暗黙になる。
   */
  charge: 'col-start-2 col-span-2 row-start-1',
  attack: 'col-start-1 col-span-2 row-start-2',
  guard: 'col-start-3 col-span-2 row-start-2',
}

/**
 * 3つの行動ボタンを、チャージを頂点とする三角形に並べる。
 *
 * 横並びだとチャージが左端に来る。チャージはゲーム中で最も選ぶ回数が多いのに、
 * スマートフォンを右手で持つと親指がいちばん届きにくい位置になっていた。
 * 上段中央に置けば、左右どちらの手で持っても届く。
 *
 * 対戦画面とLPのプレビューが同じものを使う。以前はグリッドの指定と3つの
 * ActionButton が両方のファイルに手で複製されていた。プレビューが実物を
 * 実コンポーネントで描いていても、複製された「並べ方」までは追従しない——
 * これが表面化したのが Issue #82（プレビューだけ自分のステータスと行動ボタンの
 * 上下が逆だった）。配置をここ1箇所に集めて、複製そのものをなくしている。
 */
export function ActionTriangle({ stateOf, onSelect }: ActionTriangleProps) {
  return (
    /*
     * DOM順は ACTION_ORDER（charge → attack → guard）のまま。
     * 上段中央 → 下段左 → 下段右という見た目の順序と一致するので、
     * 読み上げ順・タブ順が見た目とずれない。並べ替えるときはここが崩れないか確かめること。
     */
    <div className="grid grid-cols-4 gap-2.5">
      {ACTION_ORDER.map((action) => {
        const { status, reasonLabel } = stateOf?.(action) ?? { status: 'idle' as const }
        return (
          <ActionButton
            key={action}
            action={action}
            status={status}
            reasonLabel={reasonLabel}
            onSelect={() => onSelect(action)}
            className={ACTION_CELL[action]}
          />
        )
      })}
    </div>
  )
}
