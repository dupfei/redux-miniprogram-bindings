import { App, LifetimesSets, PrivateProvider } from './types'

declare const getApp: () => App

const LIFETIMES: LifetimesSets = {
  wechat: {
    page: ['onLoad', 'onUnload'],
    component: ['attached', 'detached'],
  },
  alipay: {
    page: ['onLoad', 'onUnload'],
    component: ['didMount', 'didUnmount'],
  },
}

let PROVIDER: PrivateProvider | null = null

// 该函数只要能正常执行，表示一定能获取到 PROVIDER 值
export default function getProvider() {
  if (!PROVIDER) {
    const app = getApp()
    if (!app) {
      throw new Error('App 实例对象不存在')
    }

    const { provider } = app
    if (!provider) {
      throw new Error('App 实例对象上不存在 provider 对象')
    }

    const { platform = 'wechat', store, namespace = '', manual = false } = provider
    if (platform && platform !== 'wechat' && platform !== 'alipay') {
      throw new Error('platform 只能是 wechat 或 alipay')
    }
    if (!store) {
      throw new Error('Redux 的 Store 实例对象不存在')
    }

    PROVIDER = { store, namespace, manual, lifetimes: LIFETIMES[platform] }
  }

  return PROVIDER
}
