import { MapState, MapStateArray, MapStateFunction, IAnyObject } from '../types'
import getProvider from '../provider'
import { isArray, isFunction, isPlainObject, isEmptyObject } from '../utils'

function handleMapStateArray(mapState: MapStateArray) {
  const state = getProvider().store.getState()
  const ownState: IAnyObject = {}
  for (let i = 0, len = mapState.length; i < len; i++) {
    const key = mapState[i]
    if (key in state) {
      ownState[key] = state[key]
    }
  }
  return isEmptyObject(ownState) ? null : ownState
}

function handleMapStateFunction(mapState: MapStateFunction) {
  const ownState = mapState(getProvider().store.getState())
  if (!isPlainObject(ownState)) {
    throw new Error('mapState 函数必须返回一个对象')
  }
  return isEmptyObject(ownState) ? null : ownState
}

// 返回的永远是 一个非空对象 或 null
export default function handleMapState(mapState: MapState) {
  if (isArray(mapState)) {
    return handleMapStateArray(mapState)
  }
  if (isFunction(mapState)) {
    return handleMapStateFunction(mapState)
  }
  return null
}
