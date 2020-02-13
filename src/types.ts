import { Store, ActionCreator, Dispatch, AnyAction } from 'redux'

type Merge<T, U> = {
  [K in keyof (T & U)]: K extends keyof T ? T[K] : K extends keyof U ? U[K] : never
}

export type IAnyObject = Record<string, unknown>

export type IAnyArray = unknown[]

type Platform = 'wechat' | 'alipay'

interface Provider {
  platform?: Platform
  store: Store
  namespace?: string
  manual?: boolean
}

export type PrivateProvider = Merge<Required<Omit<Provider, 'platform'>>, { lifetimes: Lifetimes }>

export type App = Merge<{ provider: Provider }, IAnyObject>

type IType = 'page' | 'component'

type Lifetimes = Record<IType, [string, string]>

export type LifetimesSets = Record<Platform, Lifetimes>

export type MapStateArray = string[]
export type MapStateFunction = (state: IAnyObject) => IAnyObject
export type MapState = MapStateArray | MapStateFunction

export interface Getter {
  (): unknown
  __ob__?: boolean
}

type OwnState = IAnyObject | null
type UpdateDeps = string[] | null
export type handleMapStateReturn = [OwnState, UpdateDeps]

export type MapDispatchObject = Record<string, ActionCreator<AnyAction>>
export type MapDispatchFunction = (dispatch: Dispatch) => Record<string, Function>
export type MapDispatch = MapDispatchObject | MapDispatchFunction

export interface ConnectOption {
  type?: IType
  mapState?: MapState
  mapDispatch?: MapDispatch
  manual?: boolean
}

export type ICallback = () => void

export type SetData = (data: IAnyObject, callback?: ICallback) => void

export type PageComponentOption = Merge<
  { data?: IAnyObject; setData: SetData; methods?: Record<string, Function> },
  IAnyObject
>

export interface QueueItem {
  thisArg: PageComponentOption
  data: IAnyObject
  diffData?: IAnyObject
  callbacks: ICallback[]
}
