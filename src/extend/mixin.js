import { isObj, isFunc, hasProp } from '../utils'

let _mixin = {}
let _mixinKeys = []

export function setMixin(mixin) {
  if (!isObj(mixin)) throw new TypeError(`混入参数必须是一个对象`)

  _mixinKeys = Object.keys(mixin)
  let i = _mixinKeys.length
  while (i--) {
    if (!isFunc(mixin[_mixinKeys[i]])) throw new TypeError('目前只支持混入方法')
  }

  _mixin = mixin
}

export function injectMixin(target) {
  let i = _mixinKeys.length
  while (i--) {
    const key = _mixinKeys[i]
    if (!hasProp(target, key)) target[key] = _mixin[key]
  }
}
