import { MapState, IAnyObject } from '../types'
import { useState } from '../extend/hooks'
import { hasOwnProperty, isPlainObject } from '../utils'

export default function handleMapState(mapState: MapState): IAnyObject {
  const state = useState()
  const ownState: IAnyObject = {}

  for (let i = 0, len = mapState.length; i < len; i++) {
    const curr = mapState[i]
    switch (typeof curr) {
      case 'string': {
        if (hasOwnProperty.call(state, curr)) {
          ownState[curr] = state[curr]
        }
        break
      }
      case 'function': {
        const funcResult = curr(state)
        if (isPlainObject(funcResult)) {
          Object.assign(ownState, funcResult)
        }
        break
      }
    }
  }

  return ownState
}
