import { getProvider } from '../provider'

export const useStore = () => getProvider().store

export const useState = () => getProvider().store.getState()

export const useDispatch = () => {
  const { store } = getProvider()
  return store.dispatch.bind(store)
}
