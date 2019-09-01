export const isObj = val =>
  Object.prototype.toString.call(val) === '[object Object]'

export const hasProp = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)

export const isFunc = val => typeof val === 'function'
