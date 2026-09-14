import type { CSSProperties } from 'react'
import { ACTION_STYLE } from '@/components/actionStyle'
import { ROLE_STYLE } from '@/components/roleStyle'
import { ActionIcon } from '@/components/ActionIcon'
import { CHANGE_ROW_DELAY, REVEAL_DELAY } from '@/components/motion'
import { ACTION_LABEL, outcomeHeadline } from '@/game/copy'
import { RESULT_DURATION_MS, RESULT_DURATION_ON_VICTORY_MS } from '@/game/presets'
import type { BattlePreset, TurnRecord } from '@/game/types'
import { BattleFrame } from '@/pages/Battle/BattleFrame'

interface TurnResultProps {
  lastTurn: TurnRecord
  preset: BattlePreset
  turn: number
  secondsRemaining: number
  isFinal: boolean
}

function outcomeSubline(outcome: TurnRecord['outcome']): string {
  switch (outcome) {
    case 'player-hit-cpu':
      return '相手に 1 ダメージ'
    case 'cpu-hit-player':
      return '自分が 1 ダメージを受けた'
    case 'clash':
      return 'お互いの攻撃が相殺された'
    case 'player-guarded':
      return '相手の攻撃をガードした（自分のエネルギー+1）'
    case 'cpu-guarded':
      return '攻撃をガードされた（相手のエネルギー+1）'
    default:
      return ''
  }
}

interface ChangeRow {
  label: string
  beforeText: string
  afterText: string
  colorClass: string
  /** 誰の変化かを行の左端の帯で示す */
  edgeClass: string
}

/**
 * HPの行の text-damage は「ダメージ」を表す色で、attack という行動を表しているわけではない。
 * 色の値はたまたま同じだが軸が違うので、ACTION_STYLE ではなく専用のトークンを使う。
 * 一方でエネルギーの行は「ガードで増えた／チャージで増えた」という行動由来なので ACTION_STYLE を使う。
 */
function buildChangeRows(lastTurn: TurnRecord): ChangeRow[] {
  const rows: ChangeRow[] = []

  if (lastTurn.cpuBefore.hp !== lastTurn.cpuAfter.hp) {
    rows.push({
      label: '相手 HP',
      beforeText: String(lastTurn.cpuBefore.hp),
      afterText: String(lastTurn.cpuAfter.hp),
      colorClass: 'text-damage',
      edgeClass: ROLE_STYLE.opponent.edgeClass,
    })
  }
  if (lastTurn.playerBefore.hp !== lastTurn.playerAfter.hp) {
    rows.push({
      label: '自分 HP',
      beforeText: String(lastTurn.playerBefore.hp),
      afterText: String(lastTurn.playerAfter.hp),
      colorClass: 'text-damage',
      edgeClass: ROLE_STYLE.player.edgeClass,
    })
  }
  if (lastTurn.playerBefore.energy !== lastTurn.playerAfter.energy) {
    rows.push({
      label: '自分 ENERGY',
      beforeText: String(lastTurn.playerBefore.energy),
      afterText: String(lastTurn.playerAfter.energy),
      colorClass:
        lastTurn.outcome === 'player-guarded'
          ? ACTION_STYLE.guard.textClass
          : ACTION_STYLE.charge.textClass,
      edgeClass: ROLE_STYLE.player.edgeClass,
    })
  }
  if (lastTurn.cpuBefore.energy !== lastTurn.cpuAfter.energy) {
    rows.push({
      label: '相手 ENERGY',
      beforeText: String(lastTurn.cpuBefore.energy),
      afterText: String(lastTurn.cpuAfter.energy),
      colorClass:
        lastTurn.outcome === 'cpu-guarded'
          ? ACTION_STYLE.guard.textClass
          : ACTION_STYLE.charge.textClass,
      edgeClass: ROLE_STYLE.opponent.edgeClass,
    })
  }
  if (
    lastTurn.playerAction === 'guard' &&
    lastTurn.playerBefore.guardCooldownRemaining !== lastTurn.playerAfter.guardCooldownRemaining
  ) {
    rows.push({
      label: '自分 ガード',
      beforeText: 'READY',
      afterText: `${lastTurn.playerAfter.guardCooldownRemaining}T`,
      colorClass: 'text-accent-hover',
      edgeClass: ROLE_STYLE.player.edgeClass,
    })
  }

  return rows
}

export function TurnResult({ lastTurn, preset, turn, secondsRemaining, isFinal }: TurnResultProps) {
  const changeRows = buildChangeRows(lastTurn)
  const subline = outcomeSubline(lastTurn.outcome)
  const isHit = lastTurn.outcome === 'player-hit-cpu' || lastTurn.outcome === 'cpu-hit-player'
  const totalMs = isFinal ? RESULT_DURATION_ON_VICTORY_MS : RESULT_DURATION_MS

  return (
    <BattleFrame
      maxHp={preset.initialHp}
      turn={turn}
      phaseBadge="RESULT"
      opponent={{ state: lastTurn.cpuAfter, hpBefore: lastTurn.cpuBefore.hp }}
      player={{ state: lastTurn.playerAfter, hpBefore: lastTurn.playerBefore.hp }}
      damageFlashDelayClass={REVEAL_DELAY.headline}
      statusBand={
        /*
          選択フェーズの「行動を選択してください」と同じ位置に来る、状態の帯。
          どちらも「今この画面で何が起きているか」を伝える aria-live の1行で、
          枠が共通になったことで位置も揃っている（Issue #111 / #113）。

          aria-live はこのブロックにだけ付ける。上の TURN n / RESULT まで含めると、
          毎秒変わる数字のせいでターン番号まで読み上げ直されてしまう。

          この帯は44pxで、BattleFrame の54pxのスロットに中央寄せされる（上下に5pxずつ空く）。
          54px を超えるとスロットが伸び、その分だけ下の相手ステータスがずれて
          選択フェーズと食い違う。中身を足すときは高さを実測すること。

          HandSelection の帯には animate-fade-rise が付いていてここには付いていないが、
          これは揃え忘れではない。あちらは動くものが何もないので「新しいターンが来た」ことを
          登場演出で伝える必要があるが、こちらはバーが常に動いているのでその役割が済んでいる。
          揃えようとして向こうを消さないこと。
        */
        <div className="flex flex-col gap-2" aria-live="polite">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-meta font-semibold tracking-[0.08em] text-text-secondary">
              {isFinal ? '対戦結果へ' : 'NEXT TURN IN'}
            </span>
            <span className="font-sans text-2xl font-bold tabular-nums text-text-primary">
              {secondsRemaining}
              <span className="font-mono text-meta font-semibold text-text-tertiary">s</span>
            </span>
          </div>
          {/*
            バーはJSで幅を計算せず、CSSアニメーション1本に任せている（index.css の .countdown-bar）。
            幅を secondsRemaining から出していたころは、この値が整数（Math.ceil）なので
            8段階でしか変わらず、1段ごとに約1秒止まって見えていた。

            数字とバーはどちらも残り時間を表しているが、粒度が違うので段では一致しない。
            数字は秒単位（8s → 7s）、バーは連続的に減る。数字が「8s」でもバーは93%、
            といった状態になるのが正しい。

            再生時間は game/presets.ts のフェーズ長をそのまま渡す。motion.ts には置かない。
            あちらは演出の段取りで、これはフェーズの長さという別のもの。
            ここに値を写すと、presets.ts を変えたときにバーだけ黙ってずれる。
          */}
          <div className="h-1 overflow-hidden rounded-[2px] bg-bg-track">
            {/* 角丸は親の overflow-hidden がクリップするので、ここには要らない */}
            <div
              className="countdown-bar h-full bg-[#566B80]"
              style={{ '--countdown-duration': `${totalMs}ms` } as CSSProperties}
            />
          </div>
        </div>
      }
    >
      {/*
        出した手のカードが両側から入り、そこから
        「ぶつかった → どうなった → 何が変わったか」と続く。
        遅延の値は components/motion.ts にまとまっている。

        要素を出し入れしているわけではないことに注意。すべて最初からDOMにあり、
        animation-delay で見えていないだけなので、stateもタイマーも増えていない。

        min-h-full でスクロール領域いっぱいに広がる。これがないと中身が上詰めのままで、
        背の高い画面では下端と自分ステータスの間に空きが残る（Issue #118）。
        min-h なので、あふれる画面では中身の高さが優先され、切り取られない。
      */}
      <div className="flex min-h-full flex-col gap-4">
        {/*
          自分のカードは左から、相手のカードは右から入れる。並び（自分が左・相手が右）は
          Versus と共通で、画面をまたいでどちら側が自分かが入れ替わらないようにしている。
          動きの向きもその並びに従わせることで、「両端から出てきて中央でぶつかる」が成立する。

          余った高さはこの行が吸収する（grow）。選択フェーズが同じ空きを対峙の円
          （HandSelection の BattleArena）で埋めているのと同じ役どころで、
          結果フェーズでは「公開された対峙」がそれにあたる。

          flex-1 ではなく grow を使っているが、**ここでは両者の結果は同じ**。
          5サイズで差し替えて実測したところ、カードの高さも空きも1pxも変わらなかった。
          flex-basis: 0 でもカードが潰れないのは、flexアイテムの min-height が既定で auto で
          min-content 未満に縮まないうえ、親の高さが min-h（definite でない）なので
          あふれる画面では余白が0になり、どちらも同じ計算に落ちるため。
          grow にしているのは「自然な高さ ＋ 余った分」という意図がそのまま読めるからで、
          flex-1 だと壊れるからではない。

          max-h は伸びすぎの歯止め。タブレット・PC幅ではカードの幅が約182px
          （max-w-md 448px から px-4・VSの w-8・gap を引いて半分）で、上限なしだと
          768×1024（縦長のタブレット）で約400pxまで伸び、40pxのアイコンと短い文字に対して
          中身がスカスカの縦長の箱になる。280pxだと約1:1.55に収まって見栄えがする。
          280px という値は、PCサイズ（1280×900 / 1440×900）で自然に伸びる265pxより
          わずかに大きく取ったもの。**PCでは上限に当たらない**ので、そちらの見た目は
          純粋に「空きを埋めた結果」になる。
          代わりに 768×1024 では122pxの空きが残る（上限なしなら0、Issue #118 の前は258px）。
          カードが縦長の空箱になるよりはましだという判断。

          文字を大きくすると（Issue #120）中身の自然高が増え、上ブロックが伸びて
          スクロール領域も減るので、カードに配られる余りはその分小さくなる
          （PCサイズで273px → 265px）。上限を下げる必要はなかったのでそのままにしている。

          なお中身が280pxを超えると overflow: visible のまま下の見出しに重なる。
          今の中身は約155pxなので余裕があるが、上限値を触るときはここも一緒に見ること。
        */}
        <div className="flex max-h-[280px] grow items-stretch gap-2.5">
          <div
            className={`animate-enter-left flex flex-1 flex-col items-center justify-center gap-3 rounded-card border ${ROLE_STYLE.player.surfaceClass} py-6 shadow-card`}
          >
            <span className="font-mono text-meta font-bold tracking-[0.14em] text-text-secondary">
              {ROLE_STYLE.player.label}
            </span>
            <span className={ACTION_STYLE[lastTurn.playerAction].textClass}>
              <ActionIcon action={lastTurn.playerAction} size={40} strokeWidth={1.6} />
            </span>
            <span className="font-sans text-base font-extrabold text-text-primary">
              {ACTION_LABEL[lastTurn.playerAction]}
            </span>
          </div>
          {/* 両側のカードが入り終わったところで弾ける。ぶつかった瞬間そのもの */}
          <div
            className={`animate-impact ${REVEAL_DELAY.impact} flex w-8 flex-none items-center justify-center font-mono text-xs font-extrabold tracking-[0.06em] text-text-tertiary`}
          >
            VS
          </div>
          <div
            className={`animate-enter-right flex flex-1 flex-col items-center justify-center gap-3 rounded-card border ${ROLE_STYLE.opponent.surfaceClass} py-6 shadow-card`}
          >
            <span className="font-mono text-meta font-bold tracking-[0.14em] text-text-secondary">
              {ROLE_STYLE.opponent.label}
            </span>
            <span className={ACTION_STYLE[lastTurn.cpuAction].textClass}>
              <ActionIcon action={lastTurn.cpuAction} size={40} strokeWidth={1.6} />
            </span>
            <span className="font-sans text-base font-extrabold text-text-primary">
              {ACTION_LABEL[lastTurn.cpuAction]}
            </span>
          </div>
        </div>

        {/*
          ぶつかった直後に「で、どうなったか」が弾んで出る。決着したターンだけ
          大きく弾ませて（final-pop）、いつものターンとの差を付ける。同じ動きを
          最終結果画面の「勝利」「敗北」にも使っていて、次の画面への続きになる。
        */}
        <div
          className={`${isFinal ? 'animate-final-pop' : 'animate-pop-in'} ${REVEAL_DELAY.headline} ${
            isHit
              ? 'flex flex-col items-center gap-2 rounded-card border border-damage/30 bg-damage/10 px-4 py-6'
              : 'flex flex-col items-center gap-2 rounded-card border border-border-default bg-bg-card px-4 py-6 shadow-card'
          }`}
        >
          <span
            className={
              isHit
                ? 'font-sans text-3xl font-extrabold text-damage'
                : 'font-sans text-3xl font-extrabold text-text-primary'
            }
          >
            {outcomeHeadline(lastTurn.outcome)}
          </span>
          {subline && (
            <span className="font-sans text-sm font-semibold text-text-primary">{subline}</span>
          )}
        </div>

        {changeRows.length > 0 ? (
          /*
            行だけでなく、行を入れる枠（bg-bg-track の帯）も一緒に出すこと。
            枠を出しっぱなしにすると、行が出てくるまでの間ずっと空の灰色の箱が
            置かれたままになり、読み込み中のプレースホルダのように見える。
            1行目と同じ遅延にして、枠と1行目が同時に現れるようにしている。
          */
          <div
            className={`animate-fade-rise ${CHANGE_ROW_DELAY[0]} flex flex-none flex-col gap-px overflow-hidden rounded-chip border border-border-default bg-bg-track`}
          >
            {changeRows.map((row, index) => (
              <div
                key={row.label}
                /*
                  上から順に出す。行数は buildChangeRows の分岐と同じ最大5なので
                  CHANGE_ROW_DELAY を超えることはない。仮に超えても壊れはせず
                  遅延のクラスが付かないだけだが、それだと1行だけ先に出て目立つので
                  最後の値で頭打ちにしている。
                */
                className={`animate-row-in ${CHANGE_ROW_DELAY[index] ?? CHANGE_ROW_DELAY[CHANGE_ROW_DELAY.length - 1]} flex items-center justify-between border-l-[3px] ${row.edgeClass} bg-bg-row px-4 py-3`}
              >
                <span className="font-mono text-meta font-semibold tracking-[0.06em] text-text-secondary">
                  {row.label}
                </span>
                <span className="font-sans text-sm font-bold tabular-nums text-text-primary">
                  {row.beforeText} <span className="text-text-tertiary">→</span>{' '}
                  <span className={row.colorClass}>{row.afterText}</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p
            className={`animate-row-in ${CHANGE_ROW_DELAY[0]} rounded-chip border border-border-default bg-bg-card px-4 py-4 text-center font-sans text-sm font-semibold text-text-tertiary shadow-card`}
          >
            ステータス変化なし
          </p>
        )}
      </div>
    </BattleFrame>
  )
}
