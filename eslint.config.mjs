import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', '.netlify/**'],
  },
  ...coreWebVitals,
  ...typescript,
];

export default config;
