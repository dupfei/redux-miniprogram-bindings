import { ConnectOption } from '../types'
export default function connect({
  type,
  mapState,
  mapDispatch,
  manual,
}?: ConnectOption): (options: {
  [x: string]: unknown
  data?: Record<string, unknown> | undefined
  setData: import('../types').SetData
  methods?: Record<string, Function> | undefined
}) => void | {
  [x: string]: unknown
  data?: Record<string, unknown> | undefined
  setData: import('../types').SetData
  methods?: Record<string, Function> | undefined
}
