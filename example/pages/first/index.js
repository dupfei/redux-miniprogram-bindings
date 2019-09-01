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
    a: { b: [1, { e: true }, 3], c: 1, d: { f: '2' } },
  },

  onLoad() {
    setTimeout(() => {
      this.setUserInfo({ name: '新用户名', age: 24 })
      this.$setData({
        a: { b: [1, { e: false }, 3, 4], c: 1, d: { f: '2' } },
      })
      setTimeout(() => {
        this.$setData({
          'a.d': { f: 1 },
        })
      }, 3000)
    }, 3000)
  },

  reset() {
    store.dispatch(setCounter(0))
  },
  navigate() {
    wx.navigateTo({ url: '../second/index' })
  },
})
