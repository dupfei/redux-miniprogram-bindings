import { getProvider } from '../provider'
import { SubscribeHandler, IAnyObject, Selector, Ref } from 'src/types'

export const useStore = () => getProvider().store

export const useState = () => getProvider().store.getState()

export function useDispatch() {
  const { store } = getProvider()
  return store.dispatch.bind(store)
}

export function useSubscribe(handler: SubscribeHandler) {
  const { store } = getProvider()
  let prevState = <IAnyObject>store.getState()
  return store.subscribe(() => {
    const currState = <IAnyObject>store.getState()
    handler(currState, prevState)
    prevState = currState
  })
}

export function useRef<V = unknown>(selector: Selector<V>) {
  const { store } = getProvider()
  const ref = {} as Ref<V>
  Object.defineProperty(ref, 'value', {
    configurable: false,
    enumerable: true,
    get() {
      return selector(store.getState())
    },
  })
  return ref
}
