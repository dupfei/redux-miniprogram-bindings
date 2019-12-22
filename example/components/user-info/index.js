import { connect } from '../../lib/redux-miniprogram-bindings'

connect({
  type: 'component',
  mapState: ['userInfo'],
})({})
