import { MapState, PageComponentOption } from '../types'
export default function subscription(
  thisArg: PageComponentOption,
  mapState: MapState,
  updateDeps: string[]
): () => void
