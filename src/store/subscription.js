import { getStore } from './store'

export default function subscription(ownStateKeys, storeName) {
  const store = getStore()

  let prevState = store.getState()
  const unsubscribe = store.subscribe(() => {
    let hasChange = false
    const currState = store.getState()
    const ownStateChanges = ownStateKeys.reduce((acc, key) => {
      if (currState[key] !== prevState[key]) {
        hasChange = true
        acc[`${storeName}.${key}`] = currState[key]
      }
      return acc
    }, {})
    if (hasChange) this.setData(ownStateChanges)
    prevState = currState
  })

  return unsubscribe
}
