import { createRequire } from 'module'

// eslint-config-next 16 liefert Flat-Config-Arrays (CJS). createRequire umgeht
// die CJS/ESM-Default-Interop-Fallen beim Import in eine .mjs-Datei.
const require = createRequire(import.meta.url)
const coreWebVitals = require('eslint-config-next/core-web-vitals')
const typescript = require('eslint-config-next/typescript')

const asArray = (mod) => (Array.isArray(mod) ? mod : mod.default)

export default [
  ...asArray(coreWebVitals),
  ...asArray(typescript),
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },
  {
    // Neu in eslint-config-next 16 gebündelte React-Compiler-Regeln. Sie treffen
    // auch bestehenden (deployten) und vendorten shadcn-Code (z. B. ui/sidebar).
    // Als Warnung sichtbar, ohne den gesamten Lint zu blockieren — bewusste,
    // schrittweise Adoption statt Big-Bang-Refactor.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/incompatible-library': 'warn',
    },
  },
]
