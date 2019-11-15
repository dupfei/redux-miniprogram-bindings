import { isObj, isEmptyObj, isFunc } from '../utils'
import diff from './diff'
import SetDataQueue from './setDataQueue'

const setDataQueue = new SetDataQueue()

export default function setData(obj, cb) {
  if (!isObj(obj)) throw new TypeError(`setData第一个参数必须是一个对象`)

  if (isEmptyObj(obj)) {
    if (isFunc(cb)) cb()
    return
  }

  const diffData = diff(obj, this.data)
  if (isEmptyObj(diffData)) {
    if (isFunc(cb)) cb()
  } else {
    setDataQueue.push(this, diffData, cb)
  }
}
