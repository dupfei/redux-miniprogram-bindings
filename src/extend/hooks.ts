import { SubscribeHandler, IAnyObject, Selector, Ref } from '../types'
import { getProvider } from '../provider'

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

export function useSelector<V = unknown>(selector: Selector<V>, deps?: string[]) {
  // 依赖项不合法或不存依赖项时，返回传入的原函数
  if (!Array.isArray(deps) || deps.length < 1) {
    return selector
  }

  let lastState: IAnyObject = {}
  let lastResult: V
  return function (state: IAnyObject) {
    // 通过浅比较判断依赖的 state 是否发生改变，决定是否重新执行函数
    if (deps.some((k) => lastState[k] !== state[k])) {
      lastState = state
      lastResult = selector(state)
    }
    return lastResult
  }
}
