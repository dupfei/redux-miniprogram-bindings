import { INCREMENT, DECREMENT, SET_COUNTER } from '../actions/counter'

const initState = 0

export default function counter(state = initState, action) {
  switch (action.type) {
    case INCREMENT:
      return state + action.step
    case DECREMENT:
      return state - action.step
    case SET_COUNTER:
      return action.counter
    default:
      return state
  }
}
