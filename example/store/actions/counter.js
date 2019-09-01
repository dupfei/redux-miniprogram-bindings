export const INCREMENT = 'INCREMENT'

export const DECREMENT = 'DECREMENT'

export const SET_COUNTER = 'SET_COUNTER'

export const increment = (step = 1) => ({ type: INCREMENT, step })

export const decrement = (step = 1) => ({ type: DECREMENT, step })

export const setCounter = counter => ({ type: SET_COUNTER, counter })
