import { IAnyObject } from './types'

export const isArray = Array.isArray

export const isFunction = (value: unknown): value is Function => typeof value === 'function'

const _toString = Object.prototype.toString

export const isPlainObject = <T extends IAnyObject = IAnyObject>(value: unknown): value is T =>
  _toString.call(value) === '[object Object]'

export const getType = (value: unknown) => _toString.call(value)

export const getKeys = Object.keys

export const isEmptyObject = (value: IAnyObject) => getKeys(value).length < 1

export const warn = (message: string) => {
  throw new Error(message)
}
