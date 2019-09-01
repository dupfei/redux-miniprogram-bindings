import { terser } from 'rollup-plugin-terser'

export default {
  input: './src/index.js',
  output: [
    {
      file: './dist/mpext.js',
      format: 'es',
    },
    {
      file: './example/lib/mpext.js',
      format: 'es',
    },
  ],
  plugins: process.env.NODE_ENV === 'production' ? [terser()] : [],
}
