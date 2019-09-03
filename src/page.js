import presetStateConf from './store/presetStateConf'
import { getStore } from './store/store'
import injectState from './store/injectState'
import subscription from './store/subscription'
import { isFunc, isEmptyObj } from './utils'
import bindActionCreators from './store/bindActionCreators'
import setData from './extend/setData'
import { getMixin } from './extend/mixin'

export default function $page(config = {}) {
  const {
    storeName,
    hasMapState,
    ownStateKeys,
    hasMapDispatch,
    ownActionCreators,
  } = presetStateConf(config)

  return function(option) {
    const { onLoad, onUnload } = option
    const hasStore = !!getStore()
    let unsubscribe = null
    const mixin = getMixin()
    const hasMixin = !isEmptyObj(mixin)

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

    if (hasStore && hasMapDispatch) {
      Object.assign(option, bindActionCreators(ownActionCreators))
    }

    option.$setData = function(...args) {
      setData.apply(this, args)
    }

    if (hasMixin) Object.assign(option, mixin)

    return Page(option)
  }
}
