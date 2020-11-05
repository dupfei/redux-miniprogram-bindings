import { ProviderStore, Lifetimes, Provider, ReduxBindingsProvider } from './types'
import { isPlainObject, isFunction, warn } from './utils'

declare const __PLATFORM__: 'wechat' | 'alipay'
declare const my: Record<string, unknown>

const providerStore: ProviderStore = __PLATFORM__ === 'alipay' ? my : Object.create(null)

const genLifetimes = (component2 = false): Lifetimes => ({
  page: ['onLoad', 'onUnload'],
  component:
    __PLATFORM__ === 'alipay'
      ? [component2 ? 'onInit' : 'didMount', 'didUnmount']
      : ['attached', 'detached'],
})

export function setProvider(provider: Provider): void {
  if (!isPlainObject(provider)) {
    warn('provider必须是一个Object')
  }

  const { store, namespace = '', component2 = false } = provider
  if (
    !store ||
    !isFunction(store.getState) ||
    !isFunction(store.dispatch) ||
    !isFunction(store.subscribe)
  ) {
    warn('store必须为Redux的Store实例对象')
  }

  providerStore.__REDUX_BINDINGS_PROVIDER__ = {
    store,
    lifetimes: genLifetimes(component2),
    namespace,
  }
}

export function getProvider(): ReduxBindingsProvider {
  if (!providerStore.__REDUX_BINDINGS_PROVIDER__) {
    warn('请先设置provider')
  }

  return providerStore.__REDUX_BINDINGS_PROVIDER__!
}
