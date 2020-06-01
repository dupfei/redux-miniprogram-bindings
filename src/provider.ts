import { Provider, PrivateProvider } from './types'
import { target } from './platform'
import { isPlainObject, warn } from './utils'

export function setProvider(config: Provider) {
  if (!isPlainObject(config)) {
    warn('provider必须是一个Object')
  }

  const { store, namespace = '', manual = false } = config

  if (!store) {
    warn('store必须为Redux的Store实例对象')
  }

  target.$$provider = { store, namespace, manual }
}

export function getProvider() {
  if (!target.$$provider) {
    warn('请先设置provider')
  }

  return target.$$provider as PrivateProvider
}
