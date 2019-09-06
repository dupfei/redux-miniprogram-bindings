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

export default function $page(config = {}) {
  if (!isObj(config)) throw new TypeError('配置参数必须是一个对象')

  const {
    storeName,
    hasMapState,
    ownStateKeys,
    hasMapDispatch,
    ownActionCreators,
  } = presetStoreConf(config)

  return function(option) {
    const { onLoad, onUnload } = option
    const hasStore = !!getStore()
    let unsubscribe = null

    option.onLoad = function(query) {
      if (hasStore && hasMapState) {
        injectState.call(this, ownStateKeys, storeName)
        unsubscribe = subscription.call(this, ownStateKeys, storeName)
      }
      if (onLoad) onLoad.call(this, query)
    }

    option.onUnload = function() {
      if (onUnload) onUnload.call(this)
      if (isFunc(unsubscribe)) {
        unsubscribe()
        unsubscribe = null
      }
    }

    injectMixin(option)

    if (hasStore && hasMapDispatch) injectDispatch(option, ownActionCreators)

    option.$setData = function(...args) {
      setData.apply(this, args)
    }

    return Page(option)
  }
}
