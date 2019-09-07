import { isObj, isFunc, hasProp } from '../utils'

let _mixin = null
let _mixinKeys = null

export function setMixin(mixin) {
  if (!isObj(mixin)) throw new TypeError(`混入参数必须是一个对象`)

  const mixinKeys = Object.keys(mixin)
  let i = mixinKeys.length

  if (i < 1) return

  while (i--) {
    if (!isFunc(mixin[mixinKeys[i]])) throw new TypeError('目前只支持混入方法')
  }

  _mixin = mixin
  _mixinKeys = mixinKeys
}

export function injectMixin(target) {
  if (!_mixin) return

  let i = _mixinKeys.length
  while (i--) {
    const key = _mixinKeys[i]
    if (!hasProp(target, key)) target[key] = _mixin[key]
  }
}
