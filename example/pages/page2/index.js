import { connect, useState, useDispatch, useSubscribe } from '../../lib/redux-miniprogram-bindings'
import { setUserInfo } from '../../store/actions/userInfo'

Page(
  connect({
    mapState: [
      (state) => ({
        userName: state.userInfo.name,
      }),
    ],
    manual: true,
  })({
    data: {
      inputValue: '',
    },

    onLoad() {
      console.log('onLoad', this.data.userName)
      // 启用订阅
      this.unsubscribe = useSubscribe((currState, prevState) => {
        if (currState.userInfo.name !== prevState.userInfo.name) {
          console.log('userName change')
        }
      })
    },

    onUnload() {
      console.log('onUnload', this.data.userName)
      // 解除订阅
      this.unsubscribe()
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
  }),
)
