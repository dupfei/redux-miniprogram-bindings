import {
  MapState,
  MapStateArray,
  MapStateFunction,
  IAnyObject,
  handleMapStateReturn,
} from '../types'
import getProvider from '../provider'
import { isArray, isFunction, isPlainObject, isEmptyObject, getKeys } from '../utils'

let updateDeps: string[] = []

function defineReactive(state: IAnyObject) {
  const stateKeys = getKeys(state)
  for (let i = 0, l = stateKeys.length; i < l; i++) {
    const key = stateKeys[i]
    const descriptor = Object.getOwnPropertyDescriptor(state, key)
    if (descriptor && descriptor.configurable === false) {
      throw new Error(
        'Function 类型的 mapState 需要使用 defineProperty 进行依赖收集，请勿将 configurable 属性定义为 false'
      )
    }

    const getter = descriptor && descriptor.get
    // 对已经定义过依赖收集监听的进行过滤
    if (
      getter &&
      // @ts-ignore
      getter.__ob__
    ) {
      continue
    }

    const setter = descriptor && descriptor.set
    let value = state[key]

    const _getter = () => {
      if (updateDeps.indexOf(key) < 0) {
        updateDeps.push(key)
      }
      return getter ? getter.call(state) : value
    }
    // @ts-ignore
    _getter.__ob__ = true

    const _setter = (newVal: unknown) => {
      if (getter && !setter) return
      if (setter) {
        setter.call(state, newVal)
      } else {
        value = newVal
      }
    }

    Object.defineProperty(state, key, {
      configurable: true,
      enumerable: true,
      get: _getter,
      set: _setter,
    })
  }
}

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

function handleMapStateFunction(
  mapState: MapStateFunction,
  collectDeps: boolean
): handleMapStateReturn {
  const state = getProvider().store.getState()
  if (collectDeps) {
    updateDeps = []
    defineReactive(state)
  }
  const ownState = mapState(state)
  if (!isPlainObject(ownState)) {
    throw new Error('mapState 函数必须返回一个对象')
  }
  return [isEmptyObject(ownState) ? null : ownState, collectDeps ? [...updateDeps] : null]
}

// 返回的永远是 一个非空对象 或 null
export default function handleMapState(
  mapState: MapState,
  collectDeps = false
): handleMapStateReturn {
  if (isArray(mapState)) {
    return [handleMapStateArray(mapState), collectDeps ? [...mapState] : null]
  }
  if (isFunction(mapState)) {
    return handleMapStateFunction(mapState, collectDeps)
  }
  return [null, null]
}
