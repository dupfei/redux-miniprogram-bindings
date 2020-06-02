import { Unsubscribe } from 'redux'
import { ConnectOption, PageComponentOption, IAnyObject, IAnyArray } from '../types'
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
    // 用于之后判断当前实例是页面还是组件
    options.$$type = type

    if (isArray(mapState) && mapState.length > 0) {
      const ownState = handleMapState(mapState)
      const [onLoadKey, onUnloadKey] = lifetimes[type]
      const oldOnLoad = <Function | undefined>options[onLoadKey]
      const oldOnUnload = <Function | undefined>options[onUnloadKey]
      let unsubscribe: Unsubscribe | null = null

      // 向options的data选项中混入依赖的state的初始值
      options.data = Object.assign(
        options.data || {},
        namespace ? { [namespace]: ownState } : ownState,
      )

      options[onLoadKey] = function (...args: IAnyArray) {
        // 注入依赖的state的最新值
        const ownState = handleMapState(mapState)
        if (!isEmptyObject(ownState)) {
          const diffData = diff(
            ownState,
            <IAnyObject>(namespace ? (<PageComponentOption>this.data)[namespace] : this.data),
            namespace,
          )
          if (!isEmptyObject(diffData)) {
            this.setData(diffData)
          }
        }

        // 监听依赖的state的改变
        unsubscribe = subscription(this, mapState)

        if (oldOnLoad) {
          oldOnLoad.apply(this, args)
        }
      }

      options[onUnloadKey] = function (...args: IAnyArray) {
        if (oldOnUnload) {
          oldOnUnload.call(this, args)
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
