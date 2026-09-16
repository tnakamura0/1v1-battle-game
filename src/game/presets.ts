import type { BattlePreset, BattleSetup } from '@/game/types'

// 1はサドンデス用。1発で決着するため運の比重が上がる（cpu.test.ts の勝率のしきい値も参照）
export const INITIAL_HP_OPTIONS = [1, 2, 3] as const

export const GUARD_COOLDOWN_OPTIONS = [1, 2, 3] as const

export const CPU_DIFFICULTY_OPTIONS = ['normal', 'strong'] as const

export const DEFAULT_PRESET: BattlePreset = {
  initialHp: 2,
  guardCooldownTurns: 3,
  cpuDifficulty: 'normal',
}

/*
 * DEFAULT_PRESET と値は同じだが、型が違う（cpuDifficulty が必須かどうか）。
 * 「どのおすすめと一致するか」を比べる側は3項目すべてが埋まっている必要があるので、
 * その形をこちらが持つ。DEFAULT_PRESET から導出しているので値が二重管理にはならない。
 */
export const DEFAULT_SETUP: BattleSetup = {
  initialHp: DEFAULT_PRESET.initialHp,
  guardCooldownTurns: DEFAULT_PRESET.guardCooldownTurns,
  cpuDifficulty: DEFAULT_PRESET.cpuDifficulty ?? 'normal',
}

/**
 * 画面に並べる「おすすめ設定」の一覧。
 *
 * 設定値と名前を1つの配列に持たせている。名前は表示文言なので copy.ts に分けることも
 * できるが、そうすると「値の配列」と「名前の配列」を同じ順で保つ約束が新しく生まれる。
 * ここではルールの定義そのものが名前を含む、と考えて1箇所にまとめている。
 *
 * ルール選択画面だけでなく、結果画面と共有テキストもここを見る（Issue #131）。
 * 出した設定がどのおすすめと一致するかは matchRecommendedSetup で判定する。
 *
 * **UIに「プリセット」という語は出さないこと**（Issue #54）。コード上の
 * BattlePreset / presets.ts という名前と、画面上の「おすすめ設定」は別物として扱う。
 */
export const RECOMMENDED_SETUPS: ReadonlyArray<{
  key: string
  title: string
  description: string
  setup: BattleSetup
  /**
   * danger は「一撃で決まる特殊なモード」を色でも伝えるためのもの。
   * 乗せるのは**タイトルの文字とチップだけ**で、カードの枠線と面には乗せない。
   *
   * 枠線に乗せないのは、枠線が「選択中」を表すチャンネルだから。かつては未選択時だけ
   * 枠線を danger にしていたが、選択すると accent に変わるため、1本の枠線が
   * 「モードの性格」と「選択されている状態」のあいだで意味を乗り換えていた。
   * 選んだ瞬間にいちばん強い手がかりが消えるうえ、1つのチャンネルに2つの意味を
   * 同じ場所で載せないという既定方針（index.css 冒頭を参照）にも反する。
   * 文字とチップは状態で変化しないので、選んでも性格が消えない。
   *
   * 面を塗らないのは、3枚のうち1枚だけ光ると accent が表す「選択中」と
   * 紛らわしくなるため。
   */
  tone?: 'danger'
}> = [
  {
    key: 'casual',
    title: 'サクッと遊ぶ',
    description: '短期決戦でテンポよく',
    // 「サクッと遊ぶ」は既定値そのものにする。ルール選択画面の初期表示でこのおすすめが
    // 選択中に見えるのはこの一致によるものなので、DEFAULT_SETUP から導出して同期を保つ。
    setup: DEFAULT_SETUP,
  },
  {
    key: 'serious',
    title: '真剣勝負',
    description: '読み合いをじっくり',
    setup: { initialHp: 3, guardCooldownTurns: 2, cpuDifficulty: 'strong' },
  },
  {
    key: 'sudden-death',
    title: 'サドンデス',
    description: '一撃で決着',
    setup: { initialHp: 1, guardCooldownTurns: 1, cpuDifficulty: 'strong' },
    tone: 'danger',
  },
]

/**
 * BattlePreset を、3項目すべてが埋まった BattleSetup に正規化する。
 *
 * cpuDifficulty が optional なのは、この項目を後から足したときに既存の呼び出しを
 * 壊さないためだった。省略された preset は既定（ふつう）として扱う。
 * 省略のまま比較すると undefined !== 'normal' で「サクッと遊ぶ」に一致しなくなる。
 */
export function toSetup(preset: BattlePreset): BattleSetup {
  return {
    initialHp: preset.initialHp,
    guardCooldownTurns: preset.guardCooldownTurns,
    cpuDifficulty: preset.cpuDifficulty ?? DEFAULT_SETUP.cpuDifficulty,
  }
}

/**
 * preset と一致するおすすめ設定を返す。どれとも一致しなければ undefined。
 *
 * ルール選択画面では「どのカードが選択中か」の判定に、結果画面と共有テキストでは
 * 「ルール名を名乗れるか」の判定に使う。同じ一致の定義を2箇所で持たないための共有。
 *
 * **BattlePreset に項目を増やしたら、この比較にも足すこと。** 3項目を直に並べているので
 * 足し忘れても型エラーにならず、「違う設定なのにルール名を名乗る」形で静かに壊れる。
 */
export function matchRecommendedSetup(
  preset: BattlePreset,
): (typeof RECOMMENDED_SETUPS)[number] | undefined {
  const setup = toSetup(preset)
  return RECOMMENDED_SETUPS.find(
    (recommended) =>
      recommended.setup.initialHp === setup.initialHp &&
      recommended.setup.guardCooldownTurns === setup.guardCooldownTurns &&
      recommended.setup.cpuDifficulty === setup.cpuDifficulty,
  )
}

export const MAX_ENERGY = 5

// 3→2→1 と自然にカウントダウン表示できるよう秒単位で区切っている
export const INTRO_DURATION_MS = 3000
export const RESULT_DURATION_MS = 8000
export const RESULT_DURATION_ON_VICTORY_MS = 5000
