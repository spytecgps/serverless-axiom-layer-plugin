const js = require('@eslint/js')
const typescript = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const prettier = require('eslint-plugin-prettier')
const prettierConfig = require('eslint-config-prettier')
const simpleImportSort = require('eslint-plugin-simple-import-sort')

module.exports = [
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.config.js',
      'eslint.config.*',
    ],
  },

  // JavaScript files (CommonJS entry points)
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        module: 'writable',
        require: 'readonly',
        exports: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'simple-import-sort': simpleImportSort,
      prettier,
    },
    rules: {
      // Prettier
      'prettier/prettier': 'error',

      // TypeScript handles these
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',

      // TypeScript rules
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // Import sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // Disable rules that conflict with Prettier
  prettierConfig,
]
