import { ConnectOption, PageComponentOption } from '../types'
export default function connect({
  type,
  mapState,
  mapDispatch,
  manual,
}?: ConnectOption): (
  options: PageComponentOption,
) => void | {
  [x: string]: unknown
  data?: Record<string, unknown> | undefined
  methods?: Record<string, Function> | undefined
  setData: (data: Record<string, unknown>, callback?: (() => void) | undefined) => void
  $$instanceId: symbol
}
export declare const $page: (
  config?: ConnectOption,
) => (
  options: PageComponentOption,
) => void | {
  [x: string]: unknown
  data?: Record<string, unknown> | undefined
  methods?: Record<string, Function> | undefined
  setData: (data: Record<string, unknown>, callback?: (() => void) | undefined) => void
  $$instanceId: symbol
}
export declare const $component: (
  config?: ConnectOption,
) => (
  options: PageComponentOption,
) => void | {
  [x: string]: unknown
  data?: Record<string, unknown> | undefined
  methods?: Record<string, Function> | undefined
  setData: (data: Record<string, unknown>, callback?: (() => void) | undefined) => void
  $$instanceId: symbol
}
