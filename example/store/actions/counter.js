export const INCREMENT = 'INCREMENT'

export const DECREMENT = 'DECREMENT'

export const SET_COUNT = 'SET_COUNT'

export const increment = (step = 1) => ({ type: INCREMENT, step })

export const decrement = (step = 1) => ({ type: DECREMENT, step })

export const setCount = (count) => ({ type: SET_COUNT, count })
