import { MapState, PageComponentOption } from '../types'
export default function subscription(
  thisArg: PageComponentOption,
  mapState: MapState
): import('redux').Unsubscribe
