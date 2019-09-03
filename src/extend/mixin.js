import { isObj, isFunc } from '../utils'

let _mixin = {}

export function getMixin() {
  return _mixin
}

export function setMixin(option) {
  if (!isObj(option)) throw new TypeError(`${option}不是一个对象`)

  const allIsFunc = Object.keys(option).every(key => isFunc(option[key]))
  if (!allIsFunc) throw new TypeError('目前只支持混入方法')

  _mixin = option
}
