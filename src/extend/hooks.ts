import getProvider from '../provider'

export const useStore = () => getProvider().store

export const useDispatch = () => getProvider().store.dispatch
