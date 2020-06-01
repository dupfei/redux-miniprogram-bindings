import { ConnectOption, PageComponentOption } from '../types'
export default function connect({
  type,
  mapState,
  mapDispatch,
  manual,
}?: ConnectOption): (
  options: PageComponentOption
) => void | {
  [x: string]: unknown
  data?: Record<string, unknown> | undefined
  setData: import('../types').SetData
  methods?: Record<string, Function> | undefined
}
