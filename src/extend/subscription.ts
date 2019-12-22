import { IAnyObject, MapState, PageComponentOption } from '../types'
import getProvider from '../provider'
import batchUpdates from './batchUpdates'
import { isArray } from '../utils'

export default function subscription(thisArg: PageComponentOption, mapState: MapState) {
  const { store } = getProvider()

  let prevState = store.getState()
  const listener = () => {
    const currState = store.getState()
    let ownStateChanges: IAnyObject | null = null

    if (isArray(mapState)) {
      // 数组形式的 mapState 每次只查看依赖的 state 是否发生改变
      for (let i = 0, len = mapState.length; i < len; i++) {
        const key = mapState[i]
        if (currState[key] !== prevState[key]) {
          if (!ownStateChanges) {
            ownStateChanges = {}
          }
          ownStateChanges[key] = currState[key]
        }
      }
    } else {
      // 函数形式的 mapState 每次会重新执行一次
      // 既然能进入监听，表示 mapState 函数返回的一定是一个非空对象
      ownStateChanges = mapState(currState)
    }

    if (ownStateChanges) {
      batchUpdates.push(thisArg, ownStateChanges)
    }

    prevState = currState
  }

  return store.subscribe(listener)
}
