import { isObj, isEmptyObj, isFunc } from '../utils'
import diff from './diff'

export default function setData(obj, cb) {
  if (!isObj(obj)) throw new TypeError(`${obj}不是一个对象`)

  if (isEmptyObj(obj) && isFunc(cb)) return cb()

  const diffData = diff(obj, this.data)
  if (isEmptyObj(diffData)) {
    if (isFunc(cb)) cb()
  } else {
    this.setData(diffData, cb)
  }
}
