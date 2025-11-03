import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const recommended = tseslint.configs.recommended;

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
