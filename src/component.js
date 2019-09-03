import presetStateConf from './store/presetStateConf'
import { getStore } from './store/store'
import injectState from './store/injectState'
import subscription from './store/subscription'
import { isFunc, isEmptyObj } from './utils'
import bindActionCreators from './store/bindActionCreators'
import setData from './extend/setData'
import { getMixin } from './extend/mixin'

export default function $component(config = {}) {
  const {
    storeName,
    hasMapState,
    ownStateKeys,
    hasMapDispatch,
    ownActionCreators,
  } = presetStateConf(config)

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

    if (hasStore && hasMapDispatch) {
      Object.assign(option.methods, bindActionCreators(ownActionCreators))
    }

    option.methods.$setData = function(...args) {
      setData.apply(this, args)
    }

    if (hasMixin) Object.assign(option.methods, mixin)

    return Component(option)
  }
}
