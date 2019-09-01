import { getStore } from './store'

export default function bindActionCreators(actionCreators) {
  const { dispatch } = getStore()
  return Object.keys(actionCreators).reduce((acc, key) => {
    const actionCreator = actionCreators[key]
    acc[key] = (...args) => dispatch(actionCreator(...args))
    return acc
  }, {})
}
