import typescript2 from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

const isProd = process.env.NODE_ENV === 'production'

export default [
  {
    input: './src/index.ts',
    output: {
      file: `./dist/redux-miniprogram-bindings${isProd ? '.min' : ''}.js`,
      format: 'es',
    },
    plugins: [
      typescript2({
        useTsconfigDeclarationDir: true,
      }),
      ...(isProd ? [terser()] : []),
    ],
  },
  {
    input: './src/index.ts',
    output: {
      file: `./example/lib/redux-miniprogram-bindings.js`,
      format: 'es',
    },
    plugins: [
      typescript2({
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
          },
        },
      }),
    ],
  },
]
