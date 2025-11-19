module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
  ],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh',
    '@typescript-eslint',
    'jsx-a11y',
    'import',
    'sonarjs',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  rules: {
    // ========== BASE CONFIGURATION ==========
    'prettier/prettier': 'off',
    
    // ========== REACT RULES - STRICT ==========
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
    'react/button-has-type': 'warn', // Changed to warn - needs manual surgical fixes
    'react/jsx-boolean-value': 'error',
    'react/no-array-index-key': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unused-prop-types': 'error',
    'react/jsx-no-constructed-context-values': 'error',
    'react/no-unstable-nested-components': 'warn',
    'react/default-props-match-prop-types': 'error',
    'react/static-property-placement': 'error',
    'react/jsx-curly-brace-presence': 'error',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // ========== TYPESCRIPT RULES - STRICT ==========
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-use-before-define': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/method-signature-style': 'error',
    
    // ========== GENERAL RULES - STRICT ==========
    'no-restricted-globals': ['error', 'isNaN'],
    'no-nested-ternary': 'error',
    'no-case-declarations': 'error',
    'no-plusplus': 'error',
    'no-console': 'warn', // Changed to warn - debug logs are often intentional
    'no-fallthrough': 'error',
    'no-undef': 'error',
    'no-var': 'error',
    'no-alert': 'off',
    'no-shadow': 'error',
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
    'no-irregular-whitespace': 'off',
    'no-empty': 'off',
    'no-new-object': 'off',
    'no-unneeded-ternary': 'error',
    'no-unused-expressions': 'error',
    'no-promise-executor-return': 'error',
    'no-await-in-loop': 'warn',
    'no-cond-assign': 'error',
    'no-else-return': 'off',
    'camelcase': 'error',
    'func-names': 'error',
    'guard-for-in': 'error',
    'radix': 'error',
    'spaced-comment': 'error',
    'eqeqeq': 'off',
    'yoda': 'error',
    'vars-on-top': 'error',
    'prefer-const': 'warn',
    'prefer-template': 'error',
    'prefer-regex-literals': 'off',
    'operator-assignment': 'error',
    'array-callback-return': 'error',
    'default-case': 'error',
    
    // ========== IMPORT RULES ==========
    'import/default': 'off',
    'import/no-named-as-default': 'warn',
    'import/no-named-as-default-member': 'warn',
    'import/namespace': 'off',
    'import/extensions': ['off', 'never'],
    'import/named': 'off',
    'import/no-cycle': 'off',
    'import/no-duplicates': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-self-import': 'off',
    'import/no-unresolved': 'off',
    'import/no-useless-path-segments': 'off',
    'import/order': 'off',
    'import/newline-after-import': 'error',
    'import/no-relative-packages': 'off',
    'import/no-mutable-exports': 'error',
    'import/prefer-default-export': 'off',
    
    // ========== ACCESSIBILITY RULES - STRICT ==========
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/control-has-associated-label': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    'jsx-a11y/no-noninteractive-tabindex': 'error',
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/no-autofocus': 'warn',
    
    // ========== SONARJS RULES - CODE QUALITY ==========
    'sonarjs/no-nested-switch': 'error',
    'sonarjs/no-collapsible-if': 'error',
    'sonarjs/no-all-duplicated-branches': 'error',
    'sonarjs/no-duplicated-branches': 'error',
    'sonarjs/no-gratuitous-expressions': 'error',
    'sonarjs/no-ignored-return': 'error',
    'sonarjs/no-small-switch': 'error',
    'sonarjs/prefer-object-literal': 'error',
    'sonarjs/prefer-single-boolean-return': 'error',
    'sonarjs/prefer-immediate-return': 'off',
    'sonarjs/max-switch-cases': 'error',
    'sonarjs/cognitive-complexity': ['warn', 45],
    'sonarjs/no-identical-functions': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/no-nested-template-literals': 'off',
    
    // ========== REACT HOOKS ==========
    'react-hooks/exhaustive-deps': [
      'error',
      { additionalHooks: 'useAfterInitialEffect' },
    ],
  },
    overrides: [
    {
      files: ['*.tsx'],
      rules: {
        'react/jsx-filename-extension': 'warn', // Changed to warn - many files have no JSX
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'quotes': 'off',
        '@typescript-eslint/quotes': 'off',
        'no-undef': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist',
    'out',
    'node_modules',
    '*.config.js',
    '*.config.ts',
    '.storybook',
    'scripts/migrate-to-inline-styles.js',
    'src/components/Areteans_Extensions_createFormula/**',
  ],
};