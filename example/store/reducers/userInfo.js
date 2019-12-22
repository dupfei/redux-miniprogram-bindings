import { SET_USER_INFO } from '../actions/userInfo'

const initState = {
  name: 'userName',
  age: 25,
}

export default function userInfo(state = initState, action) {
  switch (action.type) {
    case SET_USER_INFO:
      return { ...state, ...action.userInfo }
    default:
      return state
  }
}
