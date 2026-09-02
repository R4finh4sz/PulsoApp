/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import { fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    '**/*.js',
    '**/node_modules',
    '**/build',
    '**/android',
    '**/ios',
  ]),

  ...compat.extends(
    'plugin:react/recommended',
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ),

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 13,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        __DEV__: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': fixupPluginRules(reactHooks),
      '@typescript-eslint': typescriptEslint,
      prettier,
      'prefer-arrow-functions': preferArrowFunctions,
      import: eslintPluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'react/require-default-props': 'off',
      'react/prop-types': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-no-bind': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
      'react/jsx-no-constructed-context-values': 'off',
      'react/jsx-newline': ['error', { prevent: false }],
      'import/prefer-default-export': 'off',
      'no-param-reassign': 'off',
      'import/no-duplicates': 'off',
      camelcase: 'off',
      'no-plusplus': 'off',
      'object-curly-newline': 'off',
      'consistent-return': 'off',
      'arrow-parens': 'off',
      'no-shadow': 'off',
      'no-useless-constructor': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-shadow': 'error',

      'no-use-before-define': 'off',
      'react/react-in-jsx-scope': 'off',

      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
          ignoreCase: true,
        },
      ],

      'jsx-a11y/aria-role': [
        1,
        {
          ignoreNonDOM: true,
        },
      ],

      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
        },
      ],

      'prettier/prettier': 'error',

      'react/function-component-definition': [
        2,
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],

      curly: ['error', 'all'],

      'no-restricted-imports': [
        'error',
        {
          paths: [
            'react-native-paper',
            'react-native-elements',
            '@react-native-material/core',
            'react-native-vector-icons',
            {
              name: 'react-native',
              importNames: ['Image'],
              message: 'Please import from @/components/ui/Image instead',
            },
            {
              name: 'expo-image',
              importNames: ['Image'],
              message: 'Please import from @/components/ui/Image instead',
            },
            {
              name: 'yup',
              message: 'Please import from @/validation/yup instead',
            },
            {
              name: 'zod',
              message: 'Please import from @/validation/zod instead',
            },
          ],
          patterns: ['../../*'],
        },
      ],

      'react/no-unstable-nested-components': [
        'error',
        {
          allowAsProps: true,
        },
      ],

      'prefer-arrow-functions/prefer-arrow-functions': [
        'warn',
        {
          classPropertiesAllowed: false,
          disallowPrototype: false,
          returnStyle: 'unchanged',
          singleReturnOnly: false,
        },
      ],

      'react/style-prop-object': [
        'error',
        {
          allow: ['StatusBar'],
        },
      ],

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
