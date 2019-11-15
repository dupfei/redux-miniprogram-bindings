import { isFunc } from '../utils'

export default class SetDataQueue {
  constructor() {
    this.list = []
  }

  push(thisArg, data, callback) {
    const list = this.list
    const exec = this.exec.bind(this)

    let i = list.length
    while (i--) {
      const currItem = list[i]
      if (currItem.thisArg === thisArg) {
        Object.assign(currItem.data, data)
        if (isFunc(callback)) {
          currItem.callback.push(callback)
        }
        setTimeout(exec, 0)
        return
      }
    }

    const queueItem = { thisArg, data, callback: [] }
    if (isFunc(callback)) {
      queueItem.callback.push(callback)
    }
    list.push(queueItem)
    setTimeout(exec, 0)
  }

  exec() {
    const list = this.list
    let i = list.length
    if (i === 0) return

    while (i--) {
      const { thisArg, data, callback } = list[i]
      thisArg.setData(data, () => {
        callback.forEach(cb => cb())
      })
      list.splice(i, 1)
    }
  }
}
