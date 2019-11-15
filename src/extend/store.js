import { hasProp, isObj, isFunc, isEmptyObj } from '../utils'
import diff from './diff'
import SetDataQueue from './setDataQueue'

let _store = null
const setDataQueue = new SetDataQueue()

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
    let i = mapState.length
    while (i--) {
      if (hasProp(state, mapState[i])) ownStateKeys.unshift(mapState[i])
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
    let i = mapDispatchKeys.length
    while (i--) {
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
  let i = ownStateKeys.length
  while (i--) {
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
    let i = ownStateKeys.length
    while (i--) {
      const key = ownStateKeys[i]
      if (currState[key] !== prevState[key]) {
        hasChange = true
        ownStateChanges[key] = currState[key]
      }
    }
    if (hasChange) {
      const diffData = diff(ownStateChanges, this.data[storeName], `${storeName}.`)
      if (!isEmptyObj(diffData)) setDataQueue.push(this, diffData)
    }
    prevState = currState
  })
  return unsubscribe
}

export function injectDispatch(target, ownActionCreators) {
  const keys = Object.keys(ownActionCreators)
  let i = keys.length
  while (i--) {
    const key = keys[i]
    target[key] = ownActionCreators[key]
  }
}
