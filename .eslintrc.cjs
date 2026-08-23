/**
 * ESLint para SafeTrack Chile.
 *
 * Enfocado en errores que rompen en runtime (variables inexistentes, hooks mal
 * usados) más que en estilo. Las reglas de estilo quedan como warning para no
 * ahogar el reporte: lo que importa es que `npm run lint` falle solo cuando hay
 * un problema real.
 */
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'tests'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  settings: {
    react: { version: '18.3' },
  },
  rules: {
    // El proyecto usa any de forma deliberada en varios bordes de datos.
    '@typescript-eslint/no-explicit-any': 'off',

    // TypeScript ya cubre las variables no usadas; aquí solo como aviso,
    // permitiendo el prefijo _ para descartes intencionales.
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],

    // Estas sí importan: atrapan bugs de verdad.
    'no-undef': 'off', // lo cubre TypeScript, y evita falsos positivos con tipos globales
    'no-unsafe-optional-chaining': 'error',
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-fallthrough': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    'react-refresh/only-export-components': 'off',
  },
};
