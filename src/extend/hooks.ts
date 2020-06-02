import { getProvider } from '../provider'
import { SubscribeHandler, IAnyObject } from 'src/types'

export const useStore = () => getProvider().store

export const useState = () => getProvider().store.getState()

export const useDispatch = () => {
  const { store } = getProvider()
  return store.dispatch.bind(store)
}

export const useSubscribe = (handler: SubscribeHandler) => {
  const { store } = getProvider()
  let prevState = <IAnyObject>store.getState()
  return store.subscribe(() => {
    const currState = <IAnyObject>store.getState()
    handler(currState, prevState)
    prevState = currState
  })
}
