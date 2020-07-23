import { Store, ActionCreator, Dispatch, AnyAction } from 'redux'
declare type Merge<T, U> = {
  [K in keyof (T & U)]: K extends keyof T ? T[K] : K extends keyof U ? U[K] : never
}
export declare type RequiredSome<T, K extends keyof T> = Merge<Required<Pick<T, K>>, T>
export declare type IAnyObject = Record<string, unknown>
export declare type IAnyArray = unknown[]
export interface Provider {
  store: Store
  namespace?: string
  manual?: boolean
}
export declare type PrivateProvider = Required<Provider>
export declare type Target = Merge<
  {
    $$provider?: PrivateProvider
  },
  IAnyObject
>
declare type IType = 'page' | 'component'
export declare type Lifetimes = Record<IType, [string, string]>
export declare type MapState = (string | ((state: IAnyObject) => IAnyObject))[]
export declare type MapDispatchObject = Record<string, ActionCreator<AnyAction>>
export declare type MapDispatchFunction = (dispatch: Dispatch) => Record<string, Function>
export declare type MapDispatch = MapDispatchObject | MapDispatchFunction
export interface ConnectOption {
  type?: IType
  mapState?: MapState
  mapDispatch?: MapDispatch
  manual?: boolean
}
declare type SetData = (data: IAnyObject, callback?: () => void) => void
export declare type PageComponentOption = Merge<
  {
    data?: IAnyObject
    methods?: Record<string, Function>
    setData: SetData
    $$instanceId: symbol
  },
  IAnyObject
>
export interface Context {
  id: symbol
  data: IAnyObject
  setData: SetData
}
interface QueueItem {
  context: Context
  data: IAnyObject
  diffData?: IAnyObject
}
export interface QueueRef {
  value: QueueItem[]
}
export declare type SubscribeHandler = (currState: IAnyObject, prevState: IAnyObject) => void
export declare type Selector<V> = (state: IAnyObject) => V
export declare type Ref<V> = {
  readonly value: V
}
export {}
