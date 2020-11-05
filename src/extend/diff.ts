import { IAnyObject, IAnyArray } from '../types'
import { getKeys, getType } from '../utils'

const TYPE_OBJECT = '[object Object]'
const TYPE_ARRAY = '[object Array]'

function diffObject(
  currData: IAnyObject,
  prevData: IAnyObject,
  result: IAnyObject,
  rootPath: string,
): void {
  const currDataKeys = getKeys(currData)
  const prevDataKeys = getKeys(prevData)
  const currDataKeysLen = currDataKeys.length
  const prevDataKeysLen = prevDataKeys.length

  // 都是空对象
  if (currDataKeysLen < 1 && prevDataKeysLen < 1) return

  // 其中有一个是空对象或新对象中删除了某些属性
  if (currDataKeysLen < 1 || prevDataKeysLen < 1 || currDataKeysLen < prevDataKeysLen) {
    result[rootPath] = currData
    return
  }

  for (let i = 0; i < prevDataKeysLen; i++) {
    const key = prevDataKeys[i]
    // 新对象中删除了某些属性
    if (currDataKeys.indexOf(key) < 0) {
      result[rootPath] = currData
      return
    }
  }

  for (let i = 0; i < currDataKeysLen; i++) {
    const key = currDataKeys[i]
    const currValue = currData[key]
    const targetPath = `${rootPath}.${key}`
    // 新增属性
    if (prevDataKeys.indexOf(key) < 0) {
      result[targetPath] = currValue
      continue
    }

    const prevValue = prevData[key]
    if (currValue !== prevValue) {
      const currValueType = getType(currValue)
      const prevValueType = getType(prevValue)
      if (currValueType !== prevValueType) {
        result[targetPath] = currValue
      } else {
        if (currValueType === TYPE_OBJECT) {
          diffObject(<IAnyObject>currValue, <IAnyObject>prevValue, result, targetPath)
        } else if (currValueType === TYPE_ARRAY) {
          diffArray(<IAnyArray>currValue, <IAnyArray>prevValue, result, targetPath)
        } else {
          result[targetPath] = currValue
        }
      }
    }
  }
}

function diffArray(
  currData: IAnyArray,
  prevData: IAnyArray,
  result: IAnyObject,
  rootPath: string,
): void {
  const currDataLen = currData.length
  const prevDataLen = prevData.length

  // 都是空数组
  if (currDataLen < 1 && prevDataLen < 1) return

  // 其中有一个是空数组或新数组中删除了某些项
  if (currDataLen < 1 || prevDataLen < 1 || currDataLen < prevDataLen) {
    result[rootPath] = currData
    return
  }

  for (let i = 0; i < currDataLen; i++) {
    const currValue = currData[i]
    const targetPath = `${rootPath}[${i}]`
    // 新增项
    if (i >= prevDataLen) {
      result[targetPath] = currValue
      continue
    }

    const prevValue = prevData[i]
    if (currValue !== prevValue) {
      const currValueType = getType(currValue)
      const prevValueType = getType(prevValue)
      if (currValueType !== prevValueType) {
        result[targetPath] = currValue
      } else {
        if (currValueType === TYPE_OBJECT) {
          diffObject(<IAnyObject>currValue, <IAnyObject>prevValue, result, targetPath)
        } else if (currValueType === TYPE_ARRAY) {
          diffArray(<IAnyArray>currValue, <IAnyArray>prevValue, result, targetPath)
        } else {
          result[targetPath] = currValue
        }
      }
    }
  }
}

export default function diff(
  currData: IAnyObject,
  prevData: IAnyObject,
  rootPath = '',
): IAnyObject {
  const currDataKeys = getKeys(currData)
  const prevDataKeys = getKeys(prevData)
  const currDataKeysLen = currDataKeys.length
  const prevDataKeysLen = prevDataKeys.length

  // 都是空对象
  if (currDataKeysLen < 1 && prevDataKeysLen < 1) return {}

  // 其中有一个是空对象
  if (currDataKeysLen < 1 || prevDataKeysLen < 1) {
    return rootPath ? { [rootPath]: currData } : currData
  }

  const result: IAnyObject = {}
  for (let i = 0; i < currDataKeysLen; i++) {
    const key = currDataKeys[i]
    const currValue = currData[key]
    const targetPath = rootPath ? `${rootPath}.${key}` : key
    // 新增属性
    if (prevDataKeys.indexOf(key) < 0) {
      result[targetPath] = currValue
      continue
    }

    const prevValue = prevData[key]
    if (currValue !== prevValue) {
      const currValueType = getType(currValue)
      const prevValueType = getType(prevValue)
      if (currValueType !== prevValueType) {
        result[targetPath] = currValue
      } else {
        if (currValueType === TYPE_OBJECT) {
          diffObject(<IAnyObject>currValue, <IAnyObject>prevValue, result, targetPath)
        } else if (currValueType === TYPE_ARRAY) {
          diffArray(<IAnyArray>currValue, <IAnyArray>prevValue, result, targetPath)
        } else {
          result[targetPath] = currValue
        }
      }
    }
  }

  return result
}
