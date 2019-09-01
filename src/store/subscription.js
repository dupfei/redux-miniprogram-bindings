import { getStore } from './store'
import diff from '../extend/diff'
import { isEmptyObj } from '../utils'

export default function subscription(ownStateKeys, storeName) {
  const store = getStore()

  let prevState = store.getState()
  const unsubscribe = store.subscribe(() => {
    let hasChange = false
    const currState = store.getState()
    const ownStateChanges = ownStateKeys.reduce((acc, key) => {
      if (currState[key] !== prevState[key]) {
        hasChange = true
        acc[key] = currState[key]
      }
      return acc
    }, {})
    if (hasChange) {
      const diffData = diff(
        ownStateChanges,
        this.data[storeName],
        `${storeName}.`
      )
      if (!isEmptyObj(diffData)) this.setData(diffData)
    }
    prevState = currState
  })

  return unsubscribe
}
