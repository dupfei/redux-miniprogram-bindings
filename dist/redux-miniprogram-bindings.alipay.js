const isFunction = (value) => typeof value === 'function';
const _toString = Object.prototype.toString;
const isPlainObject = (value) => _toString.call(value) === '[object Object]';
const getType = (value) => _toString.call(value);
const getKeys = Object.keys;
const { hasOwnProperty } = Object.prototype;
const warn = (message) => {
    throw new Error(message);
};

const providerStore =  my ;
const genLifetimes = (component2 = false) => ({
    page: ['onLoad', 'onUnload'],
    component:  [component2 ? 'onInit' : 'didMount', 'didUnmount']
        ,
});
function setProvider(provider) {
    if (!isPlainObject(provider)) {
        warn('provider必须是一个Object');
    }
    const { store, namespace = '', component2 = false } = provider;
    if (!store ||
        !isFunction(store.getState) ||
        !isFunction(store.dispatch) ||
        !isFunction(store.subscribe)) {
        warn('store必须为Redux的Store实例对象');
    }
    providerStore.__REDUX_BINDINGS_PROVIDER__ = {
        store,
        lifetimes: genLifetimes(component2),
        namespace,
    };
}
function getProvider() {
    if (!providerStore.__REDUX_BINDINGS_PROVIDER__) {
        warn('请先设置provider');
    }
    return providerStore.__REDUX_BINDINGS_PROVIDER__;
}

const useStore = () => getProvider().store;
const useState = () => getProvider().store.getState();
const useDispatch = () => getProvider().store.dispatch;
function useSubscribe(handler) {
    const { store } = getProvider();
    let prevState = store.getState();
    return store.subscribe(() => {
        const currState = store.getState();
        handler(currState, prevState);
        prevState = currState;
    });
}
function useRef(selector) {
    const { store } = getProvider();
    const ref = {};
    Object.defineProperty(ref, 'value', {
        configurable: false,
        enumerable: true,
        get() {
            return selector(store.getState());
        },
    });
    return ref;
}
function useSelector(selector, deps) {
    if (!Array.isArray(deps) || deps.length < 1) {
        return selector;
    }
    let lastState = {};
    let lastResult;
    return function (state) {
        if (deps.some((k) => lastState[k] !== state[k])) {
            lastState = state;
            lastResult = selector(state);
        }
        return lastResult;
    };
}

function handleMapState(mapState) {
    const state = useState();
    const ownState = {};
    for (let i = 0, len = mapState.length; i < len; i++) {
        const curr = mapState[i];
        switch (typeof curr) {
            case 'string': {
                if (hasOwnProperty.call(state, curr)) {
                    ownState[curr] = state[curr];
                }
                break;
            }
            case 'function': {
                const funcResult = curr(state);
                if (isPlainObject(funcResult)) {
                    Object.assign(ownState, funcResult);
                }
                break;
            }
        }
    }
    return ownState;
}

function handleMapDispatchObject(mapDispatch, target) {
    const dispatch = useDispatch();
    const keys = getKeys(mapDispatch);
    for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const actionCreator = mapDispatch[key];
        if (isFunction(actionCreator)) {
            target[key] = (...args) => dispatch(actionCreator.apply(null, args));
        }
    }
}
function handleMapDispatchFunction(mapDispatch, target) {
    const boundActionCreators = mapDispatch(useDispatch());
    if (!isPlainObject(boundActionCreators)) {
        warn('mapDispatch函数必须返回一个对象');
    }
    Object.assign(target, boundActionCreators);
}
function handleMapDispatch(mapDispatch, target) {
    if (isPlainObject(mapDispatch)) {
        handleMapDispatchObject(mapDispatch, target);
    }
    else if (isFunction(mapDispatch)) {
        handleMapDispatchFunction(mapDispatch, target);
    }
}

const TYPE_OBJECT = '[object Object]';
const TYPE_ARRAY = '[object Array]';
function diffObject(currData, prevData, result, rootPath) {
    const currDataKeys = getKeys(currData);
    const prevDataKeys = getKeys(prevData);
    const currDataKeysLen = currDataKeys.length;
    const prevDataKeysLen = prevDataKeys.length;
    if (currDataKeysLen < 1 && prevDataKeysLen < 1)
        return;
    if (currDataKeysLen < 1 || prevDataKeysLen < 1 || currDataKeysLen < prevDataKeysLen) {
        result[rootPath] = currData;
        return;
    }
    for (let i = 0; i < prevDataKeysLen; i++) {
        const key = prevDataKeys[i];
        if (currDataKeys.indexOf(key) < 0) {
            result[rootPath] = currData;
            return;
        }
    }
    for (let i = 0; i < currDataKeysLen; i++) {
        const key = currDataKeys[i];
        const currValue = currData[key];
        const targetPath = `${rootPath}.${key}`;
        if (prevDataKeys.indexOf(key) < 0) {
            result[targetPath] = currValue;
            continue;
        }
        const prevValue = prevData[key];
        if (currValue !== prevValue) {
            const currValueType = getType(currValue);
            const prevValueType = getType(prevValue);
            if (currValueType !== prevValueType) {
                result[targetPath] = currValue;
            }
            else {
                if (currValueType === TYPE_OBJECT) {
                    diffObject(currValue, prevValue, result, targetPath);
                }
                else if (currValueType === TYPE_ARRAY) {
                    diffArray(currValue, prevValue, result, targetPath);
                }
                else {
                    result[targetPath] = currValue;
                }
            }
        }
    }
}
function diffArray(currData, prevData, result, rootPath) {
    const currDataLen = currData.length;
    const prevDataLen = prevData.length;
    if (currDataLen < 1 && prevDataLen < 1)
        return;
    if (currDataLen < 1 || prevDataLen < 1 || currDataLen < prevDataLen) {
        result[rootPath] = currData;
        return;
    }
    for (let i = 0; i < currDataLen; i++) {
        const currValue = currData[i];
        const targetPath = `${rootPath}[${i}]`;
        if (i >= prevDataLen) {
            result[targetPath] = currValue;
            continue;
        }
        const prevValue = prevData[i];
        if (currValue !== prevValue) {
            const currValueType = getType(currValue);
            const prevValueType = getType(prevValue);
            if (currValueType !== prevValueType) {
                result[targetPath] = currValue;
            }
            else {
                if (currValueType === TYPE_OBJECT) {
                    diffObject(currValue, prevValue, result, targetPath);
                }
                else if (currValueType === TYPE_ARRAY) {
                    diffArray(currValue, prevValue, result, targetPath);
                }
                else {
                    result[targetPath] = currValue;
                }
            }
        }
    }
}
function diff(currData, prevData, rootPath = '') {
    const currDataKeys = getKeys(currData);
    const prevDataKeys = getKeys(prevData);
    const currDataKeysLen = currDataKeys.length;
    const prevDataKeysLen = prevDataKeys.length;
    if (currDataKeysLen < 1 && prevDataKeysLen < 1)
        return {};
    if (currDataKeysLen < 1 || prevDataKeysLen < 1) {
        return rootPath ? { [rootPath]: currData } : currData;
    }
    const result = {};
    for (let i = 0; i < currDataKeysLen; i++) {
        const key = currDataKeys[i];
        const currValue = currData[key];
        const targetPath = rootPath ? `${rootPath}.${key}` : key;
        if (prevDataKeys.indexOf(key) < 0) {
            result[targetPath] = currValue;
            continue;
        }
        const prevValue = prevData[key];
        if (currValue !== prevValue) {
            const currValueType = getType(currValue);
            const prevValueType = getType(prevValue);
            if (currValueType !== prevValueType) {
                result[targetPath] = currValue;
            }
            else {
                if (currValueType === TYPE_OBJECT) {
                    diffObject(currValue, prevValue, result, targetPath);
                }
                else if (currValueType === TYPE_ARRAY) {
                    diffArray(currValue, prevValue, result, targetPath);
                }
                else {
                    result[targetPath] = currValue;
                }
            }
        }
    }
    return result;
}

const queue = [];
function batchUpdate({ id, data, setData }, updater) {
    const queueItem = queue.find((q) => q.id === id);
    if (queueItem) {
        Object.assign(queueItem.updater, updater);
    }
    else {
        queue.push({ id, rootPath: getProvider().namespace, data: Object.assign({}, data), updater, setData });
    }
    Object.assign(data, updater);
    Promise.resolve().then(update);
}
function update() {
    if (queue.length < 1)
        return;
    let queueItem;
    while ((queueItem = queue.shift())) {
        const diffData = diff(queueItem.updater, queueItem.data, queueItem.rootPath);
        if (getKeys(diffData).length > 0) {
            queueItem.setData(diffData);
        }
    }
}

function subscription(context, mapState) {
    return useSubscribe((currState, prevState) => {
        const ownStateChanges = {};
        for (let i = 0, len = mapState.length; i < len; i++) {
            const curr = mapState[i];
            switch (typeof curr) {
                case 'string': {
                    if (currState[curr] !== prevState[curr]) {
                        ownStateChanges[curr] = currState[curr];
                    }
                    break;
                }
                case 'function': {
                    const funcResult = curr(currState);
                    if (isPlainObject(funcResult)) {
                        Object.assign(ownStateChanges, funcResult);
                    }
                    break;
                }
            }
        }
        if (getKeys(ownStateChanges).length > 0) {
            batchUpdate(context, ownStateChanges);
        }
    });
}

const INSTANCE_ID = Symbol('INSTANCE_ID');
function connect({ type = 'page', mapState, mapDispatch, manual = false, } = {}) {
    if (type !== 'page' && type !== 'component') {
        warn('type属性只能是page或component');
    }
    const isPage = type === 'page';
    const { lifetimes, namespace } = getProvider();
    return function processOption(options) {
        if (Array.isArray(mapState) && mapState.length > 0) {
            const ownState = handleMapState(mapState);
            options.data = Object.assign(options.data || {}, namespace ? { [namespace]: ownState } : ownState);
            const unsubscribeMap = new Map();
            const [onLoadKey, onUnloadKey] = lifetimes[type];
            const oldOnLoad = options[onLoadKey];
            const oldOnUnload = options[onUnloadKey];
            options[onLoadKey] = function (...args) {
                const getData = () => namespace ? this.data[namespace] : this.data;
                const ownState = handleMapState(mapState);
                const diffData = diff(ownState, getData(), namespace);
                if (getKeys(diffData).length > 0) {
                    this.setData(diffData);
                }
                const id = Symbol('instanceId');
                const unsubscribe = subscription({ id, data: getData(), setData: this.setData.bind(this) }, mapState);
                unsubscribeMap.set(id, unsubscribe);
                this[INSTANCE_ID] = id;
                if (oldOnLoad) {
                    oldOnLoad.apply(this, args);
                }
            };
            options[onUnloadKey] = function () {
                if (oldOnUnload) {
                    oldOnUnload.apply(this);
                }
                const id = this[INSTANCE_ID];
                if (unsubscribeMap.has(id)) {
                    const unsubscribe = unsubscribeMap.get(id);
                    unsubscribeMap.delete(id);
                    unsubscribe();
                }
            };
        }
        if (mapDispatch) {
            const target = isPage ? options : (options.methods = options.methods || {});
            handleMapDispatch(mapDispatch, target);
        }
        return manual ? options : isPage ? Page(options) : Component(options);
    };
}
function $page(config = {}) {
    config.type = 'page';
    return connect(config);
}
function $component(config = {}) {
    config.type = 'component';
    return connect(config);
}

export { $component, $page, connect, setProvider, useDispatch, useRef, useSelector, useState, useStore, useSubscribe };
