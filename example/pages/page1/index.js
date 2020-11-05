import {
  connect,
  useState,
  useDispatch,
  useRef,
  useSelector,
} from '../../lib/redux-miniprogram-bindings'
import { setCount } from '../../store/actions/counter'
import { setUserInfo } from '../../store/actions/userInfo'

const introSelector = useSelector(
  (state) => {
    console.log('重新计算')
    return { intro: `姓名：${state.userInfo.name}，年龄：${state.userInfo.age}` }
  },
  ['userInfo'],
)
const counterSelector = useSelector((state) => ({ counterText: `count数量：${state.counter}` }), [
  'counter',
])

connect({
  mapState: ['counter', introSelector, counterSelector],
  mapDispatch: (dispatch) => ({
    handleReset() {
      dispatch(setCount(0))
    },
    updateUserInfo(userInfo) {
      dispatch(setUserInfo(userInfo))
    },
  }),
})({
  data: {
    inputValue: '',
  },

  onLoad() {
    const calcUserName = (state) => {
      console.log('do calc user name')
      return state.userInfo.name
    }
    const userNameRef = useRef(useSelector(calcUserName, ['userInfo']))
    console.log('用户名', userNameRef.value)

    setTimeout(() => {
      this.updateUserInfo({
        name: '新用户名1',
        age: 26,
      })
      this.updateUserInfo({
        name: '新用户名2',
        age: 26,
      })

      console.log('用户名', userNameRef.value)
    }, 3000)
  },

  handleInput(e) {
    this.setData({
      inputValue: e.detail.value,
    })
  },
  updateUserName() {
    const state = useState()
    const dispatch = useDispatch()
    dispatch(
      setUserInfo({
        ...state.userInfo,
        name: this.data.inputValue,
      }),
    )
    this.setData({
      inputValue: '',
    })
  },
})
