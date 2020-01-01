import { Store, ActionCreator, Dispatch, AnyAction } from 'redux'
declare type Merge<T, U> = {
  [K in keyof (T & U)]: K extends keyof T ? T[K] : K extends keyof U ? U[K] : never
}
export declare type IAnyObject = Record<string, unknown>
export declare type IAnyArray = unknown[]
declare type Platform = 'wechat' | 'alipay'
interface Provider {
  platform?: Platform
  store: Store
  namespace?: string
  manual?: boolean
}
export declare type PrivateProvider = Merge<
  Required<Omit<Provider, 'platform'>>,
  {
    lifetimes: Lifetimes
  }
>
export declare type App = Merge<
  {
    provider: Provider
  },
  IAnyObject
>
declare type IType = 'page' | 'component'
declare type Lifetimes = Record<IType, [string, string]>
export declare type LifetimesSets = Record<Platform, Lifetimes>
export declare type MapStateArray = string[]
export declare type MapStateFunction = (state: IAnyObject) => IAnyObject
export declare type MapState = MapStateArray | MapStateFunction
declare type OwnState = IAnyObject | null
declare type UpdateDeps = string[] | null
export declare type handleMapStateReturn = [OwnState, UpdateDeps]
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
