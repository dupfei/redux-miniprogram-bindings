import { QueueItem, IAnyObject, Context } from '../types'
import { getProvider } from '../provider'
import diff from './diff'
import { isEmptyObject } from '../utils'

class BatchUpdates {
  private queue: QueueItem[] = []

  push(context: Context, data: IAnyObject) {
    const queue = this.queue

    let queueItem: QueueItem | undefined
    const contextId = context.id
    for (let i = 0, len = queue.length; i < len; i++) {
      if (queue[i].context.id === contextId) {
        queueItem = queue[i]
        break
      }
    }
    if (!queueItem) {
      queueItem = { context, data: {} }
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
      const { data: contextData } = queueItem.context
      const diffData = diff(
        queueItem.data,
        namespace ? <IAnyObject>contextData[namespace] : contextData,
        namespace,
      )
      if (!isEmptyObject(diffData)) {
        queueItem.diffData = diffData
      }
    }

    let queueItem: QueueItem | undefined
    while ((queueItem = queue.shift())) {
      if (queueItem.diffData) {
        queueItem.context.setData(queueItem.diffData)
      }
    }
  }
}

export default new BatchUpdates()
