# redux-miniprogram-bindings

![MIT 协议](https://img.shields.io/github/license/dpflying/redux-miniprogram-bindings)
![NPM 版本](https://img.shields.io/npm/v/redux-miniprogram-bindings)

适用于小程序的 `Redux` 绑定辅助库

## 特性

- `API` 简单灵活，只需一个 `connect` 即可轻松使用
- 功能完善，提供了多种使用方式，可满足不同的需求和使用场景
- 支持在 `XML` 页面中使用
- 执行 `dispatch` 后所有未销毁的页面(组件)内状态自动更新，依赖的视图自动触发渲染，无需额外处理
- 自动进行 `diff优化` 和 `批量队列更新` 处理，性能优异
- 同时支持 `微信小程序` 和 `支付宝小程序`

## 安装

- 通过 `npm` 或 `yarn` 安装

  ```bash
  # npm
  npm install --save redux redux-miniprogram-bindings
  # yarn
  yarn add redux redux-miniprogram-bindings
  ```

- 也可以直接引用 `dist` 文件下的 `redux-miniprogram-bindings` 文件，同时引用 `redux` 文件

## 使用

1. 创建 `Redux` 的 `Store` 实例

2. 在 `App()` 中设置 `provider`

   ```js
   import store from 'your/store/path'
   // 微信
   import { setProvider } from 'redux-miniprogram-bindings'
   // 支付宝
   // import { setProvider } from 'redux-miniprogram-bindings/dist/redux-miniprogram-bindings.alipay.min.js'

   // 在其他代码之前调用
   setProvider({ store })

   // 其他的代码...

   App({})
   ```

3. 在页面中使用

   ```js
   import { connect } from 'redux-miniprogram-bindings'
   import { actionCreator1, actionCreator2 } from 'your/store/action-creators/path'

   connect({
     mapState: ['dependent', 'state'],
     mapDispatch: {
       methodsName1: actionCreator1,
       methodsName2: actionCreator2,
     },
   })({
     onLoad() {
       // 读取 state 中的值
       const dependent = this.data.dependent
       // dispatch actionCreator1
       this.methodsName1()
       // dispatch actionCreator2
       this.methodsName2(/** ...args */)
     },
   })
   ```

4. 在组件中使用

   ```js
   import { connect } from 'redux-miniprogram-bindings'
   import { actionCreator1, actionCreator2 } from 'your/store/action-creators/path'

   connect({
     type: 'component',
     mapState: (state) => ({
       data1: state.dependent,
       data2: state.state,
     }),
     mapDispatch: (dispatch) => ({
       methodsName1: () => dispatch(actionCreator1()),
       methodsName2: (...args) => dispatch(actionCreator2(...args)),
     }),
   })({
     attached() {
       // 读取 state 中的值
       const dependent = this.data.data1
       // dispatch actionCreator1
       this.methodsName1()
       // dispatch actionCreator2
       this.methodsName2(/** ...args */)
     },
   })
   ```

5. 在 `XML` 中使用

   ```html
   <view>{{ data1 }}</view>
   ```

6. 详细用法请参考 [`API`](#API) 介绍和 [`示例`](https://github.com/DPFlying/redux-miniprogram-bindings/tree/master/example)

## API

### **provider** - `store` 配置和绑定

- **platform**：`string`

  当前小程序运行平台，可选值：`wechat` | `alipay` ，默认值：`wechat`

- **store**：`Object`

  `Redux` 的 `Store` 实例对象，必传

- **namespace**：`string`

  命名空间，默认为空。当设置命名空间后，会将所有依赖的 `state` 数据存放到以命名空间字段值为 `key` 的对象中，此时读取 `state` 值需要加上命名空间字段值。例如设置 `namespace: '$store'` ，那么在页面(组件)中获取依赖的 `state` 值需要使用 `this.data.$store.xxx` 形式

  命名空间存在的意义：1、明确知道哪些是 `store` 中的数据，哪些是 `data` 中的值；2、`store` 中的数据更改必须通过 `dispatch` 触发，可以避免无意中使用 `this.setData` 造成 `store` 中数据更改，因为更新时需要加上命名空间

- **manual**：`boolean`

  是否手动注册 `Page` 和 `Component` ，默认为 `false`。当设置为 `true` 时，`connect` 会返回整理好的 `options` 对象，需要主动调用 `Page`、`Component` 进行实例注册。这为使用者自定义扩展提供了途径。如果 `connect` 中也配置了该属性，会覆盖此处的配置，以 `connect` 中的配置为准

  ```js
  Page(
    connect({
      manual: true,
    })({})
  )
  ```

### **connect** - 连接 `store`

- **type**：`string`

  所连接实例的类型，可选值：`page` | `component`，默认值：`page`

- **mapState**：`string[] | state => Object`

  依赖的 `state`，可选。会将依赖的 `store` 数据注入到 `data` 中，自动更新

  - 数组形式：数组中的每一项为依赖的 `state` 的相应 `key` 值，页面(组件)会在依赖的 `state` 发生改变时自动更新状态和队列批量触发视图渲染

    ```js
    mapState: ['state1', 'state2']
    ```

  - 函数形式：函数接收 `state` 作为参数，可通过 `state` 获取到最新的状态数据，该函数必须返回一个对象，对象中的每一项可以是任意值，一般是根据 `state` 组合的数据。该方式会为 `state` 数据定义监听，在初次执行 `mapState` 函数时收集更新依赖的 `state` 数据，只有当这些数据发生改变时才会重新执行函数，然后对函数返回的结果和现有 `data` 中的数据进行 `diff` 比较，确认发生改变后队列批量更新渲染

    ```js
    mapState: (state) => ({
      region: state.province + state.city + state.area,
      name: state.userInfo.name,
    })
    ```

- **mapDispatch**：`Object | dispatch => Object`

  注入可执行的 `dispatch` 处理函数或任意函数，可选

  - 对象形式：`key` 值为自定义函数名，实例内通过该名称调用该方法，`value` 值为 `actionCreator` 函数。会将 `actionCreator` 函数包装成自动调用 `disptach` 的函数，并注入到实例方法中

    ```js
    mapDispatch: {
      methodsName1: actionCreator1,
      methodsName2: actionCreator2,
    }

    // 调用
    this.methodsName1()
    // 相当于
    dispatch(actionCreator1())

    // 调用
    this.methodsName2(a, b, c)
    // 相当于
    dispatch(methodsName2(a, b, c))
    ```

  - 函数形式：函数接收 `dispatch` 作为参数，返回一个对象，包含自定义整理后的处理函数

    ```js
    mapDispatch: (dispatch) => ({
      methodsName1: () => dispatch(actionCreator1()),
      methodsName2: (...args) => dispatch(actionCreator2(...args)),
    })

    // 调用
    this.methodsName1()
    this.methodsName2(a, b, c)
    ```

    **注意：** 通过 `mapDispatch` 注入的函数也可以在 `XML` 中作为事件处理函数使用。如果函数需要传递参数时请注意，事件处理函数默认会传入 `event` 对象作为第一个参数

    ```html
    <view bind:tap="handleAdd">Add</view>
    ```

- **manual**：`boolean`

  是否手动注册 `Page` 和 `Component` ，默认值为 `provider` 中配置的值或 `false` ，优先级高于 `provider` 中的配置

### **useStore** - 获取 `store` 实例对象

调用时请确保已经调用 `App()` ，如果在 `App()` 调用之前调用将无法获取到 `App` 实例对象

```js
import { useStore } from 'redux-miniprogram-bindings'

const store = useStore()
store.getState()
```

### **useDispatch** - 获取 `dispatch` 函数

```js
import { useDispatch } from 'redux-miniprogram-bindings'

const dispatch = useDispatch()
dispatch(action)
```

## `diff` 逻辑

![diff逻辑](./diff.svg)
