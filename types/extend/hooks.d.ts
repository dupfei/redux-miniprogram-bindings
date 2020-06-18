import { SubscribeHandler, Selector, Ref } from 'src/types'
export declare const useStore: () => import('redux').Store<any, import('redux').AnyAction>
export declare const useState: () => any
export declare function useDispatch(): import('redux').Dispatch<import('redux').AnyAction>
export declare function useSubscribe(handler: SubscribeHandler): import('redux').Unsubscribe
export declare function useRef<V = unknown>(selector: Selector<V>): Ref<V>
