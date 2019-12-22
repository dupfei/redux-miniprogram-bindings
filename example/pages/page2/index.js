import { connect, useStore, useDispatch } from '../../lib/redux-miniprogram-bindings'
import { setUserInfo } from '../../store/actions/userInfo'

const store = useStore()
const dispatch = useDispatch()

Page(
  connect({
    mapState: state => ({
      userName: state.userInfo.name,
    }),
    manual: true,
  })({
    data: {
      inputValue: '',
    },

    handleInput(e) {
      this.setData({
        inputValue: e.detail.value,
      })
    },
    updateUserName() {
      const { userInfo } = store.getState()
      dispatch(
        setUserInfo({
          ...userInfo,
          name: this.data.inputValue,
        })
      )
      this.setData({
        inputValue: '',
      })
    },
  })
)
