import { isObj, hasProp, isFunc } from '../utils'
import { getStore } from './store'

export default function presetStateConf(config) {
  if (!isObj(config)) throw new TypeError(`${config}不是一个对象`)

  const store = getStore()
  if (!store) return {}

  const { storeName = '$store', mapState, mapDispatch } = config

  let ownStateKeys = null
  if (Array.isArray(mapState) && mapState.length > 0) {
    const state = store.getState()
    ownStateKeys = mapState.filter(key => hasProp(state, key))
    if (ownStateKeys.length < 1) ownStateKeys = null
  }
  const hasMapState = !!ownStateKeys

  let hasMapDispatch = false
  let ownActionCreators = {}
  if (isObj(mapDispatch)) {
    Object.keys(mapDispatch).forEach(key => {
      const actionCreator = mapDispatch[key]
      if (isFunc(actionCreator)) {
        hasMapDispatch = true
        ownActionCreators[key] = actionCreator
      }
    })
  }
  if (!hasMapDispatch) ownActionCreators = null

  return {
    storeName,
    hasMapState,
    ownStateKeys,
    hasMapDispatch,
    ownActionCreators,
  }
}
