import { $component } from '../../lib/mpext'
import { increment, decrement } from '../../store/actions/counter'

$component({
  mapState: ['counter'],
  mapDispatch: { increment, decrement },
})({
  attached() {
    this.showData()
  },

  methods: {
    handleIncrement() {
      this.increment(1)
    },
    handleDecrement() {
      this.decrement(1)
    },
  },
})
