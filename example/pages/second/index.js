import { getStore, $page } from '../../lib/mpext'
import { setCounter } from '../../store/actions/counter'

const store = getStore()

$page({
  storeName: 'myStore',
  mapState: ['counter'],
})({
  reset() {
    store.dispatch(setCounter(0))
  },
})
