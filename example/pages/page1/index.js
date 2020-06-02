import { connect, useState, useDispatch } from '../../lib/redux-miniprogram-bindings'
import { setCount } from '../../store/actions/counter'
import { setUserInfo } from '../../store/actions/userInfo'

connect({
  mapState: [
    'counter',
    (state) => ({
      intro: `姓名：${state.userInfo.name}，年龄：${state.userInfo.age}`,
    }),
  ],
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
    setTimeout(() => {
      this.updateUserInfo({
        name: '新用户名1',
        age: 26,
      })
      this.updateUserInfo({
        name: '新用户名2',
        age: 26,
      })
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
