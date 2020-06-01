import { Store, ActionCreator, Dispatch, AnyAction } from 'redux'
declare type Merge<T, U> = {
  [K in keyof (T & U)]: K extends keyof T ? T[K] : K extends keyof U ? U[K] : never
}
export declare type IAnyObject = Record<string, unknown>
export declare type IAnyArray = unknown[]
export declare type Platform = 'wechat' | 'alipay'
export interface Provider {
  store: Store
  namespace?: string
  manual?: boolean
}
export declare type PrivateProvider = Required<Provider>
export interface Target {
  $$provider?: PrivateProvider
  [extraProps: string]: unknown
}
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
export declare type ICallback = () => void
export declare type SetData = (data: IAnyObject, callback?: ICallback) => void
export declare type PageComponentOption = Merge<
  {
    data?: IAnyObject
    setData: SetData
    methods?: Record<string, Function>
  },
  IAnyObject
>
export interface QueueItem {
  thisArg: PageComponentOption
  data: IAnyObject
  diffData?: IAnyObject
  callbacks: ICallback[]
}
export {}
