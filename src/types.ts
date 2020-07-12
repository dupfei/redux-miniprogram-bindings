import { Store, ActionCreator, Dispatch, AnyAction } from 'redux'

type Merge<T, U> = {
  [K in keyof (T & U)]: K extends keyof T ? T[K] : K extends keyof U ? U[K] : never
}

export type RequiredSome<T, K extends keyof T> = Merge<Required<Pick<T, K>>, T>

export type IAnyObject = Record<string, unknown>

export type IAnyArray = unknown[]

export interface Provider {
  store: Store
  namespace?: string
  manual?: boolean
}

export type PrivateProvider = Required<Provider>

export type Target = Merge<{ $$provider?: PrivateProvider }, IAnyObject>

type IType = 'page' | 'component'

export type Lifetimes = Record<IType, [string, string]>

export type MapState = (string | ((state: IAnyObject) => IAnyObject))[]

export type MapDispatchObject = Record<string, ActionCreator<AnyAction>>
export type MapDispatchFunction = (dispatch: Dispatch) => Record<string, Function>
export type MapDispatch = MapDispatchObject | MapDispatchFunction

export interface ConnectOption {
  type?: IType
  mapState?: MapState
  mapDispatch?: MapDispatch
  manual?: boolean
}

type SetData = (data: IAnyObject, callback?: () => void) => void

export type PageComponentOption = Merge<
  {
    data?: IAnyObject
    methods?: Record<string, Function>
    setData: SetData
  },
  IAnyObject
>

export interface Context {
  id: symbol
  data: IAnyObject
  setData: SetData
}

export interface QueueItem {
  context: Context
  data: IAnyObject
  diffData?: IAnyObject
}

export type SubscribeHandler = (currState: IAnyObject, prevState: IAnyObject) => void

export type Selector<V> = (state: IAnyObject) => V

export type Ref<V> = { value: V }
