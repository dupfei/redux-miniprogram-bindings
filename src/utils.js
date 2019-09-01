export const getType = val => Object.prototype.toString.call(val)

export const isObj = val => getType(val) === '[object Object]'

export const hasProp = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)

export const isFunc = val => typeof val === 'function'

export const isEmptyObj = obj => Object.keys(obj) < 1
