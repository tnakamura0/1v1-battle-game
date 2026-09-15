import { INTRO_DELAY } from '@/components/motion'
import type { BattlePreset } from '@/game/types'
import { Versus } from '@/pages/Battle/Versus'

interface BattleIntroProps {
  preset: BattlePreset
  secondsRemaining: number
}

/**
 * 対戦開始前の3秒。上から順に「残り秒数 → 対峙 → 設定」と出す。
 *
 * ## なぜカウントダウンが先頭なのか
 *
 * 対戦中は画面内の一番上に「状態の帯」（残り時間・行動を選択してください等）を固定している
 * （Issue #111 / #112 / #113）。intro だけカウントダウンが末尾にあると、intro から
 * 選択フェーズへ進むときに「いま何秒か」を見る位置が画面の下から上へ飛んでしまう。
 * ここを先頭にすることで、対戦中と目の行き先を揃えている（Issue #124）。
 *
 * 以前は先頭に「まもなく対戦開始」という見出しがあったが、カウントダウンを先頭に
 * 動かすと直後に来る「対戦開始まで」と同じことを二度言う形になるため削除した。
 * 残り時間という情報を持っているカウントダウン側を残している。
 *
 * ## なぜ画面上端に固定しないのか
 *
 * BattleFrame の状態の帯は画面上端アンカーの中の先頭スロットとして固定表示されるが、
 * intro にはそのような上下のアンカーがない。この画面は `justify-center` で
 * 中身をまとめて縦中央に置く構成で、対峙・設定と合わせて1つの塊として動くことに
 * 意味がある（対戦開始を待つ、という単発の画面なので）。カウントダウンだけを
 * 画面上端に固定すると、その塊から浮いて見える。
 *
 * 動きは Versus 自身ではなく、それを包む器に持たせている。Versus は
 * 行動選択中の画面（HandSelection の BattleArena）とも共有しているので、
 * 中で動かすと毎ターン円が動き直してしまう。
 */
export function BattleIntro({ preset, secondsRemaining }: BattleIntroProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="animate-fade-rise flex flex-col items-center gap-1">
        <span className="font-mono text-meta font-semibold tracking-[0.14em] text-text-secondary">
          対戦開始まで
        </span>
        {/*
          aria-live と aria-label は外側に残し、動かすのは内側だけにしている。
          key を付けた要素は毎秒作り直されるので、これを live region 自体にすると
          「領域ごと消えて現れる」ことになり、読み上げが不安定になる。
          内側の差し替えなら、外側の live region が3→2→1を素直に読み上げる。

          transform（scale）を効かせるために inline-block が要る。
          素の span は inline のままで、transform が無視される。
        */}
        <span
          className="font-sans text-4xl font-extrabold text-text-primary tabular-nums"
          aria-live="polite"
          aria-label={`残り${secondsRemaining}秒`}
        >
          <span key={secondsRemaining} className="inline-block animate-tick">
            {secondsRemaining}
          </span>
        </span>
      </div>

      <div className={`animate-pop-in ${INTRO_DELAY.versus}`}>
        <Versus />
      </div>

      <div
        className={`animate-fade-rise ${INTRO_DELAY.preset} flex w-full max-w-xs flex-col gap-2 rounded-chip border border-dashed border-border-default px-4 py-3 font-mono text-meta text-text-secondary`}
      >
        <div className="flex items-center justify-between">
          <span>初期HP</span>
          <span className="text-text-primary">{preset.initialHp}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>ガードクールダウン</span>
          <span className="text-text-primary">{preset.guardCooldownTurns}ターン</span>
        </div>
      </div>
    </div>
  )
}
