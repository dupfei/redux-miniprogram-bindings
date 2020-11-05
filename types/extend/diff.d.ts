import { IAnyObject } from '../types'
export default function diff(
  currData: IAnyObject,
  prevData: IAnyObject,
  rootPath?: string,
): IAnyObject
