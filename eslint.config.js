/* eslint-disable import/no-default-export */
import pluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        ignores: ['backup/**', 'node_modules/**', 'dist/**']
    },
    {
        files: ['**/*.js', '**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.jest, // Jest globals: describe, it, beforeEach, etc.
                ...globals.node, // Node.js globals: setTimeout, setInterval, require, etc.
                ...globals.browser // Browser globals: window, document, etc.
            },
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            import: pluginImport,
            '@typescript-eslint': tseslint.plugin,
            '@stylistic': stylistic
        },
        rules: {
            ...tseslint.configs.eslintRecommended.rules,
            ...tseslint.configs.recommended.rules,
            // benutzerdefinierte Regeln

            // import-Regeln
            'import/no-default-export': 'error',

            // typeScript-Regeln
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': ['warn'],
            // ersetzt "no-unused-vars": "off"

            '@typescript-eslint/no-unused-expressions': 'error',
            // ersetzt "no-unused-expressions": 0

            '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
            // ersetzt "no-use-before-define": "off"

            '@stylistic/type-annotation-spacing': 'error',

            // basierend auf "no-shadow": 0 und ESLint-Empfehlung für TS-Projekte
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': ['error'],

            // eCMAScript / Allgemeine Regeln
            'arrow-spacing': 'error',
            'array-bracket-spacing': ['error', 'never'],
            'comma-dangle': ['warn', 'never'],
            'no-cond-assign': ['error', 'except-parens'],
            'no-console': 'off',
            'no-constant-condition': 'error',
            'no-control-regex': 'error',
            'no-debugger': 'warn',
            'no-dupe-args': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'no-empty': 'error',
            'no-empty-character-class': 'error',
            'no-ex-assign': 'error',
            'no-extra-boolean-cast': 'error',
            'no-extra-semi': 'error',
            'no-func-assign': 'off',
            'no-inner-declarations': 'off',
            'no-invalid-regexp': 'error',
            'no-irregular-whitespace': 'error',
            'no-unsafe-negation': 'error',
            'no-obj-calls': 'error',
            'no-regex-spaces': 'error',
            'quote-props': ['off', 'as-needed', { 'keywords': true }],
            'no-sparse-arrays': 'off',
            'no-unreachable': 'warn',
            'no-var': 'error',
            'prefer-const': 'error',
            'use-isnan': 'error',
            'valid-jsdoc': 'off',
            'valid-typeof': 'error',
            'block-scoped-var': 'off',
            'complexity': 'off',
            'consistent-return': 'off',
            'curly': ['error', 'multi-line'],
            'default-case': 'warn',
            'dot-notation': 'off',
            'eqeqeq': 'off',
            'guard-for-in': 'warn',
            'no-alert': 'error',
            'no-caller': 'error',
            'no-div-regex': 'warn',
            'no-else-return': 'off',
            'no-labels': 'error',
            'no-eq-null': 'off',
            'no-eval': 'error',
            'no-extend-native': 'error',
            'no-extra-bind': 'error',
            'no-fallthrough': 'error',
            'no-floating-decimal': 'error',
            'no-implied-eval': 'error',
            'no-iterator': 'error',
            'no-lone-blocks': 'error',
            'no-loop-func': 'off',
            'no-multi-spaces': 'error',
            'no-multi-str': 'warn',
            'no-global-assign': 'error',
            'no-new': 'error',
            'no-new-func': 'error',
            'no-new-wrappers': 'error',
            'no-octal': 'error',
            'no-octal-escape': 'error',
            'no-param-reassign': 'off',
            'no-process-env': 'error',
            'no-proto': 'error',
            'no-redeclare': 'error',
            'no-return-assign': 'error',
            'no-script-url': 'error',
            'no-self-compare': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            // "@typescript-eslint/no-unused-expressions" ersetzt die no-unused-expressions
            'no-void': 'off',
            'no-warning-comments': ['warn',
                {
                    'terms': ['todo', 'fixme'],
                    'location': 'start'
                }
            ],
            'no-with': 'error',
            'radix': 'warn',
            'vars-on-top': 'off',
            'wrap-iife': 'off',
            'yoda': 'off',
            'strict': 'off',
            'no-catch-shadow': 'error',
            'no-delete-var': 'error',
            'no-label-var': 'error',
            // "no-shadow": "off" ist oben deaktiviert und durch die TS-Version ersetzt
            'no-shadow-restricted-names': 'error',
            'no-undef': 'error',
            'no-undef-init': 'error',
            'no-undefined': 'off',
            // "no-unused-vars": "off" ist oben deaktiviert und durch die TS-Version ersetzt
            // "no-use-before-define": "off" ist oben deaktiviert und durch die TS-Version ersetzt
            'no-mixed-requires': 'off',
            'indent': ['warn', 4, { 'SwitchCase': 1 }],
            'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
            'camelcase': 'off',
            'comma-spacing': ['error', { 'before': false, 'after': true }],
            'comma-style': ['error', 'last'],
            'consistent-this': ['warn', 'self'],
            'eol-last': 'error',
            'func-names': 'off',
            'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
            'capitalized-comments': 'off',
            'max-nested-callbacks': 'off',
            'new-cap': 'off',
            'new-parens': 'error',
            'newline-after-var': 'off',
            'no-array-constructor': 'error',
            'no-continue': 'off',
            'no-inline-comments': 'off',
            'no-lonely-if': 'error',
            'no-mixed-spaces-and-tabs': 'error',
            'no-multiple-empty-lines': 'off',
            'no-nested-ternary': 'warn',
            'no-new-object': 'error',
            'no-spaced-func': 'error',
            'no-ternary': 'off',
            'no-trailing-spaces': 'warn',
            'no-underscore-dangle': 'off',
            'no-extra-parens': ['error', 'functions'],
            'object-curly-spacing': ['warn', 'always'],
            'one-var': 'off',
            'operator-assignment': 'off',
            'padded-blocks': 'off',
            'quotes': ['error', 'single', 'avoid-escape'],
            'semi': 'error',
            'semi-spacing': ['error', { 'before': false, 'after': true }],
            'sort-vars': 'off',
            'keyword-spacing': 'error',
            'space-before-blocks': ['error', 'always'],
            'space-before-function-paren': ['error', {
                'anonymous': 'never',
                'named': 'never'
            }],
            // 'space-in-brackets' wurde in neueren ESLint-Versionen entfernt,
            // ersetzt durch 'object-curly-spacing' und 'array-bracket-spacing'
            // wir setzen es auf 'off', um Konflikte zu vermeiden.
            'space-in-parens': ['error', 'never'],
            'space-infix-ops': 'error',
            'space-unary-ops': 'error',
            'spaced-comment': ['warn', 'always', { 'markers': [','] }],
            'wrap-regex': 'off'
        }
    }
]);
