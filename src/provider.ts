import { ProviderStore, Lifetimes, Provider, ReduxBindingsProvider } from './types'
import { isPlainObject, isFunction, warn } from './utils'

const providerStore: ProviderStore = __PLATFORM__ === 'alipay' ? my : Object.create(null)

const genLifetimes = (): Lifetimes => ({
  page: ['onLoad', 'onUnload'],
  component: __PLATFORM__ === 'alipay' ? ['didMount', 'didUnmount'] : ['attached', 'detached'],
})

export function setProvider(provider: Provider) {
  if (!isPlainObject(provider)) {
    warn('provider必须是一个Object')
  }

  const { store, namespace = '' } = provider
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
    lifetimes: genLifetimes(),
    namespace,
  }
}

export function getProvider(): ReduxBindingsProvider {
  if (!providerStore.__REDUX_BINDINGS_PROVIDER__) {
    warn('请先设置provider')
  }

  return providerStore.__REDUX_BINDINGS_PROVIDER__!
}
