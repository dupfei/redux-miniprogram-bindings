import { Unsubscribe } from 'redux'
import { ConnectOption, PageComponentOption, IAnyObject, IAnyArray } from '../types'
import getProvider from '../provider'
import handleMapState from './mapState'
import handleMapDispatch from './mapDispatch'
import diff from '../extend/diff'
import subscription from '../extend/subscription'
import { isEmptyObject } from '../utils'

declare const Page: (options: PageComponentOption) => void
declare const Component: (options: PageComponentOption) => void

export default function connect({
  type = 'page',
  mapState,
  mapDispatch,
  manual,
}: ConnectOption = {}) {
  const { namespace, manual: manualDefaults, lifetimes } = getProvider()

  if (type && type !== 'page' && type !== 'component') {
    throw new Error('type 属性只能是 page 或 component')
  }

  if (typeof manual !== 'boolean') {
    // 使用全局默认值
    manual = manualDefaults
  }

  return function processOption(options: PageComponentOption) {
    const isPage = type === 'page'

    // 用于之后判断当前实例是页面还是组件
    options.$type = type

    if (mapState) {
      const [ownState, updateDeps] = handleMapState(mapState, true)
      // ownState 存在时表示 ownState 一定是非空对象，updateDeps 一定是数组，后续不需要再判断
      if (ownState) {
        const [onLoadKey, onUnloadKey] = lifetimes[type]
        const oldOnLoad = <Function | undefined>options[onLoadKey]
        const oldOnUnload = <() => void | undefined>options[onUnloadKey]
        let unsubscribe: Unsubscribe | null = null

        // 向 data 中混入依赖的 state 的初始值，提升初始渲染速度
        options.data = Object.assign(
          options.data || {},
          namespace ? { [namespace]: ownState } : ownState
        )

        options[onLoadKey] = function(...args: IAnyArray) {
          // 加载时 setData 依赖的 state 的最新值
          const diffData = diff(
            <IAnyObject>handleMapState(mapState, false)[0],
            <IAnyObject>(namespace ? (<IAnyObject>this.data)[namespace] : this.data),
            namespace
          )
          if (!isEmptyObject(diffData)) {
            // 直接调用 setData ，不需要进行 batchUpdates 处理，保证数据快速渲染
            this.setData(diffData)
          }

          // 监听依赖的 state 的改变
          unsubscribe = subscription(this, mapState, <string[]>updateDeps)

          if (oldOnLoad) oldOnLoad.apply(this, args)
        }

        options[onUnloadKey] = function() {
          if (oldOnUnload) oldOnUnload.call(this)

          // 取消监听
          if (unsubscribe) {
            unsubscribe()
            unsubscribe = null
          }
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
