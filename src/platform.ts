import { Platform, Target, Lifetimes } from './types'

declare const __PLATFORM__: Platform
declare const wx: Target
declare const my: Target

export const target: Target = __PLATFORM__ === 'wechat' ? wx : my

export const lifetimes: Lifetimes =
  __PLATFORM__ === 'wechat'
    ? { page: ['onLoad', 'onUnload'], component: ['attached', 'detached'] }
    : { page: ['onLoad', 'onUnload'], component: ['didMount', 'didUnmount'] }
