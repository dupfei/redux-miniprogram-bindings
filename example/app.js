import { setStore, setMixin } from './lib/mpext'
import store from './store/index'

setStore(store)
// 目前只支持混入方法
setMixin({
  showData() {
    console.log('当前页面（组件）的data：', this.data)
  },
})

App({})
