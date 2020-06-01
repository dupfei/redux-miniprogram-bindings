import { QueueItem, IAnyObject, PageComponentOption } from '../types'
import { getProvider } from '../provider'
import diff from './diff'
import { isEmptyObject } from '../utils'

class BatchUpdates {
  private queue: QueueItem[] = []

  push(thisArg: PageComponentOption, data: IAnyObject) {
    const queue = this.queue

    let queueItem: QueueItem | null = null
    for (let i = 0, len = queue.length; i < len; i++) {
      if (queue[i].thisArg === thisArg) {
        queueItem = queue[i]
        break
      }
    }
    if (!queueItem) {
      queueItem = { thisArg, data: {} }
      queue.push(queueItem)
    }

    Object.assign(queueItem.data, data)

    Promise.resolve().then(this.exec.bind(this))
  }

  exec() {
    if (this.queue.length < 1) return

    const queue = this.queue
    this.queue = []
    const { namespace } = getProvider()

    for (let i = 0, len = queue.length; i < len; i++) {
      const queueItem = queue[i]
      const { thisArg, data } = queueItem
      const prevData = namespace ? (<PageComponentOption>thisArg.data)[namespace] : thisArg.data
      const diffData = diff(data, <IAnyObject>prevData, namespace)
      if (!isEmptyObject(diffData)) {
        queueItem.diffData = diffData
      }
    }

    let queueItem: QueueItem | undefined
    while ((queueItem = queue.shift())) {
      const { thisArg, diffData } = queueItem
      if (diffData) {
        thisArg.setData(diffData)
      }
    }
  }
}

export default new BatchUpdates()
