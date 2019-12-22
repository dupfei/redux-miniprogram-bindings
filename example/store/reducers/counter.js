import { INCREMENT, DECREMENT, SET_COUNT } from '../actions/counter'

export default function counter(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + action.step
    case DECREMENT:
      return state - action.step
    case SET_COUNT:
      return action.count
    default:
      return state
  }
}
