import { combineReducers, createStore, applyMiddleware } from '../lib/redux'
import counter from './reducers/counter'
import userInfo from './reducers/userInfo'

// 日志打印中间件
const logger = ({ getState }) => next => action => {
  console.log('state before dispatch', getState())
  console.log('dispatch action', action)
  const res = next(action)
  console.log('state after dispatch', getState())
  return res
}

const createStoreWithMiddleware = applyMiddleware(logger)(createStore)

const rootReducer = combineReducers({
  counter,
  userInfo,
})

const store = createStoreWithMiddleware(rootReducer)

export default store
