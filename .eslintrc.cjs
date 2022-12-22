module.exports = {
  env: {
    node: true,
    browser: true,
    commonjs: true,
    amd: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'linebreak-style': ['error', 'unix'],
    'react/react-in-jsx-scope': 'off',
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
};
