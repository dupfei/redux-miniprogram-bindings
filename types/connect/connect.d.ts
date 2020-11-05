import { ConnectOption, PageComponentOption } from '../types'
export default function connect({
  type,
  mapState,
  mapDispatch,
  manual,
}?: ConnectOption): (options: PageComponentOption) => void | PageComponentOption
export declare function $page(
  config?: ConnectOption,
): (options: PageComponentOption) => void | PageComponentOption
export declare function $component(
  config?: ConnectOption,
): (options: PageComponentOption) => void | PageComponentOption
