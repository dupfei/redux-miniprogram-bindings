import { isObj, isEmptyObj, isFunc } from './utils'
import {
  getStore,
  presetStoreConf,
  injectState,
  subscription,
} from './extend/store'
import setData from './extend/setData'
import { getMixin } from './extend/mixin'

export default function $component(config = {}) {
  if (!isObj(config)) throw new TypeError('配置参数必须是一个对象')

  const {
    storeName,
    hasMapState,
    ownStateKeys,
    hasMapDispatch,
    ownActionCreators,
  } = presetStoreConf(config)

  return function(option) {
    const { attached, detached } = option
    const hasStore = !!getStore()
    let unsubscribe = null
    const mixin = getMixin()
    const hasMixin = !isEmptyObj(mixin)

    option.attached = function() {
      if (hasStore && hasMapState) {
        injectState.call(this, ownStateKeys, storeName)
        unsubscribe = subscription.call(this, ownStateKeys, storeName)
      }
      if (attached) attached.call(this)
    }

    option.detached = function() {
      if (detached) detached.call(this)
      if (isFunc(unsubscribe)) {
        unsubscribe()
        unsubscribe = null
      }
    }

    if (!option.methods) option.methods = {}

    if (hasMixin) option.methods = Object.assign(mixin, option.methods)

    if (hasStore && hasMapDispatch) {
      Object.assign(option.methods, ownActionCreators)
    }

    option.methods.$setData = function(...args) {
      setData.apply(this, args)
    }

    return Component(option)
  }
}
