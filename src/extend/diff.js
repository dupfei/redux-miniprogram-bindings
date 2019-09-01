import { hasProp, getType } from '../utils'

const TYPE_OBJECT = '[object Object]'
const TYPE_ARRAY = '[object Array]'

export default function diff(curr, prev, rootPath = '') {
  const currKeys = Object.keys(curr)
  const prevKeys = Object.keys(prev)
  const currKeysLen = currKeys.length
  const prevKeysLen = prevKeys.length

  if (!currKeysLen && !prevKeysLen) return {}

  if (!currKeysLen || !prevKeysLen) return curr

  const res = {}
  for (let i = 0; i < currKeysLen; i++) {
    const key = currKeys[i]
    const currVal = curr[key]
    const targetKey = rootPath + key
    if (!hasProp(prev, key)) {
      res[targetKey] = currVal
      continue
    }
    const prevVal = prev[key]
    if (currVal !== prevVal) {
      const currValType = getType(currVal)
      const prevValType = getType(prevVal)
      if (currValType !== prevValType) {
        res[targetKey] = currVal
      } else {
        if (currValType === TYPE_OBJECT) {
          diffObj(currVal, prevVal, res, targetKey)
        } else if (currValType === TYPE_ARRAY) {
          diffArr(currVal, prevVal, res, targetKey)
        } else {
          res[targetKey] = currVal
        }
      }
    }
  }
  return res
}

function diffObj(curr, prev, res, rootPath) {
  const currKeys = Object.keys(curr)
  const prevKeys = Object.keys(prev)
  const currKeysLen = currKeys.length
  const prevKeysLen = prevKeys.length

  if (!currKeysLen && !prevKeysLen) return

  if (!currKeysLen || !prevKeysLen || currKeysLen < prevKeysLen) {
    res[rootPath] = curr
    return
  }

  for (let i = 0; i < prevKeysLen; i++) {
    const key = prevKeys[i]
    if (!hasProp(curr, key)) {
      res[rootPath] = curr
      return
    }
  }

  for (let i = 0; i < currKeysLen; i++) {
    const key = currKeys[i]
    const currVal = curr[key]
    const targetKey = `${rootPath}.${key}`
    if (!hasProp(prev, key)) {
      res[targetKey] = currVal
      continue
    }
    const prevVal = prev[key]
    if (currVal !== prevVal) {
      const currValType = getType(currVal)
      const prevValType = getType(prevVal)
      if (currValType !== prevValType) {
        res[targetKey] = currVal
      } else {
        if (currValType === TYPE_OBJECT) {
          diffObj(currVal, prevVal, res, targetKey)
        } else if (currValType === TYPE_ARRAY) {
          diffArr(currVal, prevVal, res, targetKey)
        } else {
          res[targetKey] = currVal
        }
      }
    }
  }
}

function diffArr(curr, prev, res, rootPath) {
  const currLen = curr.length
  const prevLen = prev.length

  if (!currLen && !prevLen) return

  if (!currLen || !prevLen || currLen < prevLen) {
    res[rootPath] = curr
    return
  }

  for (let i = 0; i < currLen; i++) {
    const currVal = curr[i]
    const targetKey = `${rootPath}[${i}]`
    if (i >= prevLen) {
      res[targetKey] = currVal
      continue
    }
    const prevVal = prev[i]
    if (currVal !== prevVal) {
      const currValType = getType(currVal)
      const prevValType = getType(prevVal)
      if (currValType !== prevValType) {
        res[targetKey] = currVal
      } else {
        if (currValType === TYPE_OBJECT) {
          diffObj(currVal, prevVal, res, targetKey)
        } else if (currValType === TYPE_ARRAY) {
          diffArr(currVal, prevVal, res, targetKey)
        } else {
          res[targetKey] = currVal
        }
      }
    }
  }
}
