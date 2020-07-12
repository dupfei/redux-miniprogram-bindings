import { Unsubscribe } from 'redux'
import { ConnectOption, PageComponentOption, IAnyObject, IAnyArray, RequiredSome } from '../types'
import { getProvider } from '../provider'
import { lifetimes } from '../platform'
import handleMapState from './mapState'
import handleMapDispatch from './mapDispatch'
import diff from '../extend/diff'
import subscription from '../extend/subscription'
import { warn, isArray, isEmptyObject } from '../utils'

declare const Page: (options: PageComponentOption) => void
declare const Component: (options: PageComponentOption) => void

export default function connect({
  type = 'page',
  mapState,
  mapDispatch,
  manual,
}: ConnectOption = {}) {
  if (type !== 'page' && type !== 'component') {
    warn('type属性只能是page或component')
  }

  const isPage = type === 'page'
  const { namespace, manual: manualDefaults } = getProvider()

  if (typeof manual !== 'boolean') {
    manual = manualDefaults
  }

  return function processOption(options: PageComponentOption) {
    if (isArray(mapState) && mapState.length > 0) {
      const ownState = handleMapState(mapState)
      const [onLoadKey, onUnloadKey] = lifetimes[type]
      const oldOnLoad = <Function | undefined>options[onLoadKey]
      const oldOnUnload = <Function | undefined>options[onUnloadKey]
      let unsubscribe: Unsubscribe | null = null

      // 向 options.data 中混入依赖的 state 的初始值
      options.data = Object.assign(
        options.data || {},
        namespace ? { [namespace]: ownState } : ownState,
      )

      options[onLoadKey] = function (
        this: RequiredSome<PageComponentOption, 'data'>,
        ...args: IAnyArray
      ) {
        // 注入依赖的 state 的最新值
        const ownState = handleMapState(mapState)
        if (!isEmptyObject(ownState)) {
          const diffData = diff(
            ownState,
            namespace ? <IAnyObject>this.data[namespace] : this.data,
            namespace,
          )
          if (!isEmptyObject(diffData)) {
            this.setData(diffData)
          }
        }

        // 监听依赖的 state 的改变
        unsubscribe = subscription(
          {
            id: Symbol('contextId'),
            data: this.data,
            setData: this.setData.bind(this),
          },
          mapState,
        )

        if (oldOnLoad) {
          oldOnLoad.apply(this, args)
        }
      }

      options[onUnloadKey] = function (...args: IAnyArray) {
        if (oldOnUnload) {
          oldOnUnload.apply(this, args)
        }

        // 取消监听
        if (unsubscribe) {
          unsubscribe()
          unsubscribe = null
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

export const $page = (config: ConnectOption = {}) => connect({ ...config, type: 'page' })

export const $component = (config: ConnectOption = {}) => connect({ ...config, type: 'component' })
