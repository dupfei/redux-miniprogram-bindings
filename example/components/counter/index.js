import { $component } from '../../lib/redux-miniprogram-bindings'
import { increment, decrement } from '../../store/actions/counter'

$component({
  mapState: ['counter'],
  mapDispatch: { increment, decrement },
})({
  methods: {
    handleAdd() {
      this.increment(2)
    },
    handleReduce() {
      this.decrement(2)
    },
  },
})
