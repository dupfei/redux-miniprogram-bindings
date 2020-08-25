import { getProvider } from '../provider'
import { SubscribeHandler, IAnyObject, Selector, Ref } from 'src/types'

export const useStore = () => getProvider().store

export const useState = () => getProvider().store.getState()

export const useDispatch = () => getProvider().store.dispatch

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

  let lastState: IAnyObject
  let lastResult: unknown
  const selectorWrapper = (state: IAnyObject) => {
    if (lastState !== state) {
      lastResult = selector(state)
    }
    lastState = state
    return lastResult
  }

  const ref = {} as Ref<V>
  Object.defineProperty(ref, 'value', {
    configurable: false,
    enumerable: true,
    get() {
      return selectorWrapper(store.getState())
    },
  })

  return ref
}
