import { Unsubscribe } from 'redux'
import { ConnectOption, PageComponentOption, IAnyObject, IAnyArray } from '../types'
import { getProvider } from '../provider'
import handleMapState from './mapState'
import handleMapDispatch from './mapDispatch'
import diff from '../extend/diff'
import subscription from '../extend/subscription'
import { getKeys, warn } from '../utils'

declare const Page: (options: PageComponentOption) => void
declare const Component: (options: PageComponentOption) => void

const INSTANCE_ID = Symbol('INSTANCE_ID')

interface This extends PageComponentOption {
  [INSTANCE_ID]: symbol
}

export default function connect({
  type = 'page',
  mapState,
  mapDispatch,
  manual = false,
}: ConnectOption = {}): (options: PageComponentOption) => void | PageComponentOption {
  if (type !== 'page' && type !== 'component') {
    warn('type属性只能是page或component')
  }

  const isPage = type === 'page'
  const { lifetimes, namespace } = getProvider()

  return function processOption(options: PageComponentOption): PageComponentOption | void {
    if (Array.isArray(mapState) && mapState.length > 0) {
      // 向 options.data 中混入依赖的 state 的初始值
      const ownState = handleMapState(mapState)
      options.data = Object.assign(
        options.data || {},
        namespace ? { [namespace]: ownState } : ownState,
      )

      /**
       * 同一个组件 可以在 同一个页面中 被多次使用，分别产生各自的 unsubscribe
       * 同一个页面 也能多个实例同时存在于页面栈中，分别产生各自的 unsubscribe
       * 使用 Map 收集所有页面(组件)的 unsubscribe，销毁时，调用相应的 unsubscribe
       */
      const unsubscribeMap = new Map<symbol, Unsubscribe>()

      const [onLoadKey, onUnloadKey] = lifetimes[type]
      const oldOnLoad = <Function | undefined>options[onLoadKey]
      const oldOnUnload = <Function | undefined>options[onUnloadKey]

      options[onLoadKey] = function (this: This, ...args: IAnyArray): void {
        const getData = (): IAnyObject =>
          namespace ? <IAnyObject>this.data![namespace] : this.data!

        // 注入依赖的 state 的最新值
        const ownState = handleMapState(mapState)
        const diffData = diff(ownState, getData(), namespace)
        if (getKeys(diffData).length > 0) {
          this.setData(diffData)
        }

        // 监听依赖的 state 的改变
        const id = Symbol('instanceId')
        const unsubscribe = subscription(
          { id, data: getData(), setData: this.setData.bind(this) },
          mapState,
        )
        unsubscribeMap.set(id, unsubscribe)
        this[INSTANCE_ID] = id

        if (oldOnLoad) {
          oldOnLoad.apply(this, args)
        }
      }

      options[onUnloadKey] = function (this: This): void {
        if (oldOnUnload) {
          oldOnUnload.apply(this)
        }

        // 取消监听
        const id = this[INSTANCE_ID]
        if (unsubscribeMap.has(id)) {
          const unsubscribe = unsubscribeMap.get(id)!
          unsubscribeMap.delete(id)
          unsubscribe()
        }
      }
    }

    if (mapDispatch) {
      const target = isPage ? options : (options.methods = options.methods || {})
      handleMapDispatch(mapDispatch, target)
    }

    return manual ? options : isPage ? Page(options) : Component(options)
  }
}

export function $page(
  config: ConnectOption = {},
): (options: PageComponentOption) => void | PageComponentOption {
  config.type = 'page'
  return connect(config)
}

export function $component(
  config: ConnectOption = {},
): (options: PageComponentOption) => void | PageComponentOption {
  config.type = 'component'
  return connect(config)
}
