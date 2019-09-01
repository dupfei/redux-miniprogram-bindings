import { $page, getStore } from '../../lib/mpext'
import { setUserInfo } from '../../store/actions/userInfo'
import { setCounter } from '../../store/actions/counter'

const store = getStore()

$page({
  storeName: '$store',
  mapState: ['userInfo'],
  mapDispatch: { setUserInfo },
})({
  data: {
    navigateText: '页面跳转',
  },

  onLoad() {
    setTimeout(() => {
      this.setUserInfo({ name: '新用户名', age: 24 })
    }, 3000)
  },

  reset() {
    store.dispatch(setCounter(0))
  },
  navigate() {
    wx.navigateTo({ url: '../second/index' })
  },
})
