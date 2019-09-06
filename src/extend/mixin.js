import { isObj, isFunc } from '../utils'

let _mixin = {}

export function getMixin() {
  return _mixin
}

export function setMixin(option) {
  if (!isObj(option)) throw new TypeError(`配置参数必须是一个对象`)

  const keys = Object.keys(option)
  for (let i = 0, len = keys.length; i < len; i++) {
    if (!isFunc(option[keys[i]])) throw new TypeError('目前只支持混入方法')
  }

  _mixin = option
}
