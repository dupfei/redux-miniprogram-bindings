import { QueueItem, Context, IAnyObject } from '../types'
import diff from './diff'
import { isEmptyObject } from '../utils'

const queue: QueueItem[] = []

export function batchUpdate({ id, namespace, data, setData }: Context, updater: IAnyObject) {
  let queueItem = queue.find((q) => q.id === id)
  if (queueItem) {
    // 合并多次更新
    Object.assign(queueItem.updater, updater)
  } else {
    /**
     * 对初始值进行浅拷贝存储，作为后续执行 diff 时的原始比较对象
     * 主要为了防止 引用类型数据 被某一页面(组件)执行 setData 修改后，剩余的页面(组件) diff 结果出错的情况
     */
    queueItem = { id, rootPath: namespace, data: { ...data }, updater, setData }
    queue.push(queueItem)
  }

  // 同步更新数据
  Object.assign(data, updater)
  // 异步更新视图
  Promise.resolve().then(update)
}

function update() {
  if (queue.length < 1) return

  let queueItem
  while ((queueItem = queue.shift())) {
    const diffData = diff(queueItem.updater, queueItem.data, queueItem.rootPath)
    if (!isEmptyObject(diffData)) {
      queueItem.setData(diffData)
    }
  }
}
