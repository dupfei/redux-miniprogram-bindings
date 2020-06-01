import { IAnyObject, PageComponentOption } from '../types'
declare class BatchUpdates {
  private queue
  push(thisArg: PageComponentOption, data: IAnyObject): void
  exec(): void
}
declare const _default: BatchUpdates
export default _default
