const _toString = Object.prototype.toString
export const getType = val => _toString.call(val)

export const isObj = val => getType(val) === '[object Object]'

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasProp = (obj, key) => hasOwnProperty.call(obj, key)

export const isFunc = val => typeof val === 'function'

export const isEmptyObj = obj => Object.keys(obj).length < 1
