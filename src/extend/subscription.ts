import { IAnyObject, MapState, PageComponentOption } from '../types'
import { useStore } from './hooks'
import batchUpdates from './batchUpdates'
import { isPlainObject, isEmptyObject } from '../utils'

// 记录订阅和响应订阅的数量
let trackCount = 0
let triggerCount = 0

export default function subscription(thisArg: PageComponentOption, mapState: MapState) {
  trackCount += 1
  const store = useStore()

  let prevState = store.getState()
  const unsubscribe = store.subscribe(() => {
    triggerCount += 1
    const currState = store.getState()
    let ownStateChanges: IAnyObject | null = null

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
      batchUpdates.push(thisArg, ownStateChanges)
    }

    prevState = currState

    if (triggerCount === trackCount) {
      // 订阅已全部响应，此时可以执行更新
      triggerCount = 0
      batchUpdates.exec()
    }
  })

  return () => {
    trackCount -= 1
    unsubscribe()
  }
}
