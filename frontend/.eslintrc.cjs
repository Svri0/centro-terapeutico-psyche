module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: ['eslint:recommended'],
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: ['.eslintrc.cjs', 'dist/**', 'node_modules/**', 'public/**', 'vite.config.ts'],
  rules: {
    // React específicas
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // Generales
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off' // Desactivado para evitar conflictos con TypeScript
  }
};
