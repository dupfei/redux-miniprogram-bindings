import { QueueRef, Context, IAnyObject } from '../types'
import { getProvider } from '../provider'
import diff from './diff'
import { isEmptyObject } from '../utils'

const queueRef: QueueRef = {
  value: [],
}

export function queuePush(context: Context, data: IAnyObject) {
  queueRef.value.push({ context, data })
}

export function queueExec() {
  if (queueRef.value.length < 1) return

  const queue = queueRef.value
  queueRef.value = []

  const { namespace } = getProvider()

  /**
   * 先计算所有的 diff 结果，再依次执行 setData
   * 防止 引用类型数据 执行 setData 后造成后续的 diff 结果出错
   */
  const len = queue.length
  for (let i = 0; i < len; i++) {
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
  for (let i = 0; i < len; i++) {
    const queueItem = queue[i]
    if (queueItem.diffData) {
      queueItem.context.setData(queueItem.diffData)
    }
  }
}
