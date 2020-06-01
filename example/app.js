import store from './store/index'
import { setProvider } from './lib/redux-miniprogram-bindings'

setProvider({
  store,
  namespace: '',
  manual: false,
})

App({})
