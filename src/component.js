import { componentLifeCycle } from './lifeCycle'
import { isObj, isFunc } from './utils'
import {
  getStore,
  presetStoreConf,
  injectState,
  subscription,
  injectDispatch,
} from './extend/store'
import setData from './extend/setData'
import { injectMixin } from './extend/mixin'

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
    const { load, unload } = componentLifeCycle
    const oldLoad = option[load]
    const oldUnload = option[unload]
    const hasStore = !!getStore()
    let unsubscribe = null

    option[load] = function() {
      if (hasStore && hasMapState) {
        injectState.call(this, ownStateKeys, storeName)
        unsubscribe = subscription.call(this, ownStateKeys, storeName)
      }
      if (oldLoad) oldLoad.call(this)
    }

    option[unload] = function() {
      if (oldUnload) oldUnload.call(this)
      if (isFunc(unsubscribe)) {
        unsubscribe()
        unsubscribe = null
      }
    }

    if (!option.methods) option.methods = {}

    injectMixin(option.methods)

    if (hasStore && hasMapDispatch) {
      injectDispatch(option.methods, ownActionCreators)
    }

    option.methods.$setData = function(...args) {
      setData.apply(this, args)
    }

    return Component(option)
  }
}
