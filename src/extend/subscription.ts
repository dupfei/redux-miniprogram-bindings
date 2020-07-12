import { IAnyObject, MapState, Context } from '../types'
import { useSubscribe } from './hooks'
import batchUpdates from './batchUpdates'
import { isPlainObject, isEmptyObject } from '../utils'

// 记录订阅和响应订阅的数量
let trackCount = 0
let triggerCount = 0

export default function subscription(context: Context, mapState: MapState) {
  trackCount += 1

  const unsubscribe = useSubscribe((currState, prevState) => {
    let ownStateChanges: IAnyObject | undefined
    for (let i = 0, len = mapState.length; i < len; i++) {
      const curr = mapState[i]
      switch (typeof curr) {
        case 'string': {
          if (currState[curr] !== prevState[curr]) {
            if (!ownStateChanges) {
              ownStateChanges = {}
            }
            ownStateChanges[curr] = currState[curr]
          }
          break
        }
        case 'function': {
          const funcResult = curr(currState)
          if (isPlainObject(funcResult) && !isEmptyObject(funcResult)) {
            if (!ownStateChanges) {
              ownStateChanges = {}
            }
            Object.assign(ownStateChanges, funcResult)
          }
          break
        }
      }
    }
    if (ownStateChanges) {
      batchUpdates.push(context, ownStateChanges)
    }

    triggerCount += 1
    if (triggerCount === trackCount) {
      // 订阅已全部响应，此时可以执行更新
      triggerCount = 0
      batchUpdates.exec()
    }
  })

  return () => {
    // 取消订阅
    trackCount -= 1
    unsubscribe()
  }
}
