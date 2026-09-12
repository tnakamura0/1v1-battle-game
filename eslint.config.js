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
      ],
    },
  },
  eslintConfigPrettier,
)
