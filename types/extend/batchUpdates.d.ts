import { IAnyObject, Context } from '../types'
declare class BatchUpdates {
  private queue
  push(context: Context, data: IAnyObject): void
  exec(): void
}
declare const _default: BatchUpdates
export default _default
