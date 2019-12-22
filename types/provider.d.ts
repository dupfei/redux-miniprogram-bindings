export default function getProvider(): {
  store: import('redux').Store<any, import('redux').AnyAction>
  namespace: string
  manual: boolean
  lifetimes: Record<'page' | 'component', [string, string]>
}
