import { hasProp, isObj, isFunc, isEmptyObj } from '../utils'
import diff from './diff'

let _store = null

export function getStore() {
  return _store
}

export function setStore(store) {
  _store = store
}

export function presetStoreConf(config) {
  const result = {
    storeName: '$store',
    hasMapState: false,
    ownStateKeys: null,
    hasMapDispatch: false,
    ownActionCreators: null,
  }
  if (!_store) return result

  const { storeName, mapState, mapDispatch } = config

  if (storeName) result.storeName = storeName

  if (Array.isArray(mapState) && mapState.length > 0) {
    const state = _store.getState()
    const ownStateKeys = []
    for (let i = 0, len = mapState.length; i < len; i++) {
      if (hasProp(state, mapState[i])) ownStateKeys.push(mapState[i])
    }
    if (ownStateKeys.length > 0) {
      result.hasMapState = true
      result.ownStateKeys = ownStateKeys
    }
  }

  if (isObj(mapDispatch)) {
    let hasMapDispatch = false
    const ownActionCreators = {}
    const { dispatch } = _store
    const mapDispatchKeys = Object.keys(mapDispatch)
    for (let i = 0, len = mapDispatchKeys.length; i < len; i++) {
      const key = mapDispatchKeys[i]
      const actionCreator = mapDispatch[key]
      if (isFunc(actionCreator)) {
        hasMapDispatch = true
        ownActionCreators[key] = (...args) => dispatch(actionCreator(...args))
      }
    }
    if (hasMapDispatch) {
      result.hasMapDispatch = true
      result.ownActionCreators = ownActionCreators
    }
  }

  return result
}

export function injectState(ownStateKeys, storeName) {
  const state = _store.getState()
  const ownState = {}
  for (let i = 0, len = ownStateKeys.length; i < len; i++) {
    const key = ownStateKeys[i]
    ownState[key] = state[key]
  }
  this.setData({ [storeName]: ownState })
}

export function subscription(ownStateKeys, storeName) {
  let prevState = _store.getState()
  const unsubscribe = _store.subscribe(() => {
    let hasChange = false
    const ownStateChanges = {}
    const currState = _store.getState()
    for (let i = 0, len = ownStateKeys.length; i < len; i++) {
      const key = ownStateKeys[i]
      if (currState[key] !== prevState[key]) {
        hasChange = true
        ownStateChanges[key] = currState[key]
      }
    }
    if (hasChange) {
      const diffData = diff(
        ownStateChanges,
        this.data[storeName],
        `${storeName}.`
      )
      if (!isEmptyObj(diffData)) this.setData(diffData)
    }
    prevState = currState
  })
  return unsubscribe
}
