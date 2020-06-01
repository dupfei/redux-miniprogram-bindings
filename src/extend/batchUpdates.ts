import { QueueItem, IAnyObject, ICallback, PageComponentOption } from '../types'
import { getProvider } from '../provider'
import diff from './diff'
import { isFunction, isEmptyObject } from '../utils'

class BatchUpdates {
  private queue: QueueItem[] = []

  push(thisArg: PageComponentOption, data: IAnyObject, callback?: ICallback) {
    const queue = this.queue

    let queueItem: QueueItem | null = null
    for (let i = 0, len = queue.length; i < len; i++) {
      if (queue[i].thisArg === thisArg) {
        queueItem = queue[i]
        break
      }
    }
    if (!queueItem) {
      queueItem = { thisArg, data: {}, callbacks: [] }
      queue.push(queueItem)
    }

    Object.assign(queueItem.data, data)
    if (isFunction(callback)) {
      queueItem.callbacks.push(callback)
    }

    /**
     * 延迟到本次宏任务结束时统一执行 setData
     * 原因：
     * 小程序中调用 this.setData 时，会同步更新 data 中的值，异步更新视图
     * 因为同步更新 data 中的值，所以 data 中依赖的 state 数据会被立刻更新
     * 如果依赖的 state 数据是一个 Object ，因为 JS 中 Object 是按地址引用，所以更改后其他引用该地址的数据也会发生更改
     * 如果同一个页面中多个组件依赖于同一个 Object 类型的 state 数据，会导致第一个组件 data 更新后，之后的组件的 data 数据被 `隐式` 修改为最新
     * 使 diff 的结果为未发生改变，导致不更新
     */
    Promise.resolve().then(this.exec.bind(this))
  }

  exec() {
    if (this.queue.length < 1) return

    const queue = this.queue
    this.queue = []
    const { namespace } = getProvider()

    /**
     * 先依次执行 diff
     * 再依次执行 setData
     * 保证所有组件执行 diff 时数据都不会发生 `隐式` 修改
     */
    for (let i = 0, len = queue.length; i < len; i++) {
      const queueItem = queue[i]
      const { thisArg, data } = queueItem
      const diffData = diff(
        data,
        <IAnyObject>(namespace ? (<IAnyObject>thisArg.data)[namespace] : thisArg.data),
        namespace
      )
      if (!isEmptyObject(diffData)) {
        queueItem.diffData = diffData
      }
    }

    let queueItem: QueueItem | undefined
    while ((queueItem = queue.shift())) {
      const { thisArg, diffData, callbacks } = queueItem
      let callback: ICallback | undefined
      if (callbacks.length > 0) {
        callback = () => {
          let cb: ICallback | undefined
          while ((cb = callbacks.shift())) {
            cb()
          }
        }
      }
      if (diffData) {
        thisArg.setData(diffData, callback)
      } else if (callback) {
        callback()
      }
    }
  }
}

export default new BatchUpdates()
