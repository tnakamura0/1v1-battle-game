import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    /*
     * 行動色（attack / charge / guard）は ACTION_STYLE 経由でだけ使う。
     * ダメージとエネルギーは値が同じでも別の軸なので、専用トークン
     * （text-damage / bg-energy）を使うこと。詳しくは components/actionStyle.ts。
     *
     * この使い分けは長いことコメントにしか書かれておらず、値が同じで見た目も
     * 変わらないため、取り違えても誰も気づけなかった（Issue #80）。
     * 唯一の正解を持つ actionStyle.ts だけ除外して、他は lint で止める。
     */
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/actionStyle.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/\\b(text|bg|border)-(attack|charge|guard)\\b/]',
          message:
            '行動色は ACTION_STYLE（components/actionStyle.ts）から使うこと。ダメージなら text-damage / border-damage、エネルギー量なら bg-energy を使う。',
        },
        {
          selector: 'TemplateElement[value.raw=/\\b(text|bg|border)-(attack|charge|guard)\\b/]',
          message:
            '行動色は ACTION_STYLE（components/actionStyle.ts）から使うこと。ダメージなら text-damage / border-damage、エネルギー量なら bg-energy を使う。',
        },
        /*
         * フォントサイズの任意値を止める（Issue #120）。
         *
         * 以前は text-[8px] 〜 text-[13px] の5種が散らばり、同じ役割のラベルが
         * 画面によって1px違うところまでいっていた。基準がどこにも書かれておらず、
         * 新しい要素を足すたびに近くの値をコピーするしかなかったのが原因。
         * はしごは index.css の @theme に定義してある。
         *
         * 色の直書き（上の2つ）と同じ形で止めているのは、どちらも
         * 「見た目が少し違うだけなので、取り違えても誰も気づけない」種類の間違いだから。
         */
        {
          selector: 'Literal[value=/text-\\[[\\d.]/]',
          message:
            'フォントサイズは index.css のはしごに従うこと。10px は text-chip、11px は text-meta、12px以上は Tailwind 既定のユーティリティ（text-xs / text-sm / text-base / …）を使う。段の間が必要なら、まず index.css のはしごに段を足して名前を付けること。',
        },
        {
          selector: 'TemplateElement[value.raw=/text-\\[[\\d.]/]',
          message:
            'フォントサイズは index.css のはしごに従うこと。10px は text-chip、11px は text-meta、12px以上は Tailwind 既定のユーティリティ（text-xs / text-sm / text-base / …）を使う。段の間が必要なら、まず index.css のはしごに段を足して名前を付けること。',
        },
      ],
    },
  },
  eslintConfigPrettier,
)
