import typescript2 from 'rollup-plugin-typescript2'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'

const fileName = 'redux-miniprogram-bindings'

const genDevConf = (platform) => {
  const platformId = platform === 'wechat' ? '' : '.alipay'

  return {
    input: './src/index.ts',
    output: {
      file: `./example/lib/${fileName}${platformId}.js`,
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
      replace({
        __PLATFORM__: `"${platform}"`,
      }),
    ],
  }
}

const genProdConf = (platform) => {
  const platformId = platform === 'wechat' ? '' : '.alipay'

  return {
    input: './src/index.ts',
    output: [
      {
        file: `./dist/${fileName}${platformId}.js`,
        format: 'es',
      },
      {
        file: `./dist/${fileName}${platformId}.min.js`,
        format: 'es',
        plugins: [terser()],
      },
    ],
    plugins: [
      typescript2({
        useTsconfigDeclarationDir: true,
      }),
      replace({
        __PLATFORM__: `"${platform}"`,
      }),
    ],
  }
}

const devConf = [genDevConf('wechat')]
const prodConf = [genProdConf('wechat'), genProdConf('alipay')]

const config = process.env.NODE_ENV === 'production' ? prodConf : devConf

export default config
