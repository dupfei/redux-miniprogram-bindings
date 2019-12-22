import store from './store/index'

App({
  provider: {
    platform: 'wechat',
    store,
    namespace: '',
    manual: false,
  },
})
