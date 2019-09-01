import { getStore } from './store'

export default function injectState(ownStateKeys, storeName) {
  const state = getStore().getState()
  this.setData({
    [storeName]: ownStateKeys.reduce((acc, key) => {
      acc[key] = state[key]
      return acc
    }, {}),
  })
}
