import {
  MapDispatch,
  MapDispatchObject,
  MapDispatchFunction,
  IAnyObject,
  IAnyArray,
} from '../types'
import { getProvider } from '../provider'
import { isPlainObject, isFunction } from '../utils'

function handleMapDispatchObject(mapDispatch: MapDispatchObject, target: IAnyObject) {
  const { dispatch } = getProvider().store
  for (const key in mapDispatch) {
    const actionCreator = mapDispatch[key]
    if (isFunction(actionCreator)) {
      target[key] = (...args: IAnyArray) => dispatch(actionCreator.apply(null, args))
    }
  }
}

function handleMapDispatchFunction(mapDispatch: MapDispatchFunction, target: IAnyObject) {
  const boundActionCreators = mapDispatch(getProvider().store.dispatch)
  if (!isPlainObject(boundActionCreators)) {
    throw new Error('mapDispatch 函数必须返回一个对象')
  }
  Object.assign(target, boundActionCreators)
}

export default function handleMapDispatch(mapDispatch: MapDispatch, target: IAnyObject) {
  if (isPlainObject<MapDispatchObject>(mapDispatch)) {
    handleMapDispatchObject(mapDispatch, target)
  } else if (isFunction(mapDispatch)) {
    handleMapDispatchFunction(mapDispatch, target)
  }
}
