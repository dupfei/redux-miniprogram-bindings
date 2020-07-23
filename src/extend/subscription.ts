import { Context, MapState, IAnyObject } from '../types'
import { useSubscribe } from './hooks'
import { queuePush, queueExec } from './batchUpdates'
import { isPlainObject, isEmptyObject } from '../utils'

// 记录订阅和响应订阅的数量
let trackCount = 0
let triggerCount = 0

export default function subscription(context: Context, mapState: MapState) {
  trackCount += 1

  const unsubscribe = useSubscribe((currState, prevState) => {
    const ownStateChanges: IAnyObject = {}
    for (let i = 0, len = mapState.length; i < len; i++) {
      const curr = mapState[i]
      switch (typeof curr) {
        case 'string': {
          if (currState[curr] !== prevState[curr]) {
            ownStateChanges[curr] = currState[curr]
          }
          break
        }
        case 'function': {
          const funcResult = curr(currState)
          if (isPlainObject(funcResult)) {
            Object.assign(ownStateChanges, funcResult)
          }
          break
        }
      }
    }
    if (!isEmptyObject(ownStateChanges)) {
      // 推入队列，等待所有订阅响应完成后统一执行更新
      queuePush(context, ownStateChanges)
    }

    triggerCount += 1
    if (triggerCount === trackCount) {
      // 订阅已全部响应，执行更新
      triggerCount = 0
      queueExec()
    }
  })

  return () => {
    // 取消订阅
    trackCount -= 1
    unsubscribe()
  }
}
