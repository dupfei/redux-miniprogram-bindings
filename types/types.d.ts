import { Store, ActionCreator, Dispatch, AnyAction } from 'redux'
export declare type IAnyObject = Record<string, unknown>
export declare type IAnyArray = unknown[]
export interface Provider {
  store: Store
  namespace?: string
  component2?: boolean
}
export interface ReduxBindingsProvider {
  store: Store
  lifetimes: Lifetimes
  namespace: string
}
export interface ProviderStore {
  __REDUX_BINDINGS_PROVIDER__?: ReduxBindingsProvider
}
declare type IType = 'page' | 'component'
export declare type Lifetimes = Record<IType, [string, string]>
declare type MapStateFunction = (state: IAnyObject) => IAnyObject
export declare type MapState = (string | MapStateFunction)[]
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
export interface PageComponentOption {
  data?: IAnyObject
  methods?: Record<string, Function>
  setData: SetData
  [extraProps: string]: unknown
}
export interface Context {
  id: symbol
  data: IAnyObject
  setData: SetData
}
export interface QueueItem {
  id: symbol
  rootPath: string
  data: IAnyObject
  updater: IAnyObject
  setData: SetData
}
export declare type SubscribeHandler = (currState: IAnyObject, prevState: IAnyObject) => void
export declare type Selector<V> = (state: IAnyObject) => V
export declare type Ref<V> = {
  readonly value: V
}
export {}
