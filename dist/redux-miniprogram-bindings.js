const LIFETIMES = {
    wechat: {
        page: ['onLoad', 'onUnload'],
        component: ['attached', 'detached'],
    },
    alipay: {
        page: ['onLoad', 'onUnload'],
        component: ['didMount', 'didUnmount'],
    },
};
let PROVIDER = null;
function getProvider() {
    if (!PROVIDER) {
        const app = getApp();
        if (!app) {
            throw new Error('App 实例对象不存在');
        }
        const { provider } = app;
        if (!provider) {
            throw new Error('App 实例对象上不存在 provider 对象');
        }
        const { platform = 'wechat', store, namespace = '', manual = false } = provider;
        if (platform && platform !== 'wechat' && platform !== 'alipay') {
            throw new Error('platform 只能是 wechat 或 alipay');
        }
        if (!store) {
            throw new Error('Redux 的 Store 实例对象不存在');
        }
        PROVIDER = { store, namespace, manual, lifetimes: LIFETIMES[platform] };
    }
    return PROVIDER;
}

const isArray = Array.isArray;
const isFunction = (value) => typeof value === 'function';
const _toString = Object.prototype.toString;
const isPlainObject = (value) => _toString.call(value) === '[object Object]';
const getType = (value) => _toString.call(value);
const getKeys = Object.keys;
const isEmptyObject = (value) => getKeys(value).length < 1;

function handleMapStateArray(mapState) {
    const state = getProvider().store.getState();
    const ownState = {};
    for (let i = 0, len = mapState.length; i < len; i++) {
        const key = mapState[i];
        if (key in state) {
            ownState[key] = state[key];
        }
    }
    return isEmptyObject(ownState) ? null : ownState;
}
function handleMapStateFunction(mapState) {
    const ownState = mapState(getProvider().store.getState());
    if (!isPlainObject(ownState)) {
        throw new Error('mapState 函数必须返回一个对象');
    }
    return isEmptyObject(ownState) ? null : ownState;
}
function handleMapState(mapState) {
    if (isArray(mapState)) {
        return handleMapStateArray(mapState);
    }
    if (isFunction(mapState)) {
        return handleMapStateFunction(mapState);
    }
    return null;
}

function handleMapDispatchObject(mapDispatch, target) {
    const { dispatch } = getProvider().store;
    for (const key in mapDispatch) {
        const actionCreator = mapDispatch[key];
        if (isFunction(actionCreator)) {
            target[key] = (...args) => dispatch(actionCreator.apply(null, args));
        }
    }
}
function handleMapDispatchFunction(mapDispatch, target) {
    const boundActionCreators = mapDispatch(getProvider().store.dispatch);
    if (!isPlainObject(boundActionCreators)) {
        throw new Error('mapDispatch 函数必须返回一个对象');
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

class BatchUpdates {
    constructor() {
        this.queue = [];
    }
    push(thisArg, data, callback) {
        const queue = this.queue;
        let queueItem = null;
        for (let i = 0, len = queue.length; i < len; i++) {
            if (queue[i].thisArg === thisArg) {
                queueItem = queue[i];
                break;
            }
        }
        if (!queueItem) {
            queueItem = { thisArg, data: {}, callbacks: [] };
            queue.push(queueItem);
        }
        Object.assign(queueItem.data, data);
        if (isFunction(callback)) {
            queueItem.callbacks.push(callback);
        }
        Promise.resolve().then(this.exec.bind(this));
    }
    exec() {
        if (this.queue.length < 1)
            return;
        const queue = this.queue;
        this.queue = [];
        const { namespace } = getProvider();
        for (let i = 0, len = queue.length; i < len; i++) {
            const queueItem = queue[i];
            const { thisArg, data } = queueItem;
            const diffData = diff(data, (namespace ? thisArg.data[namespace] : thisArg.data), namespace);
            if (!isEmptyObject(diffData)) {
                queueItem.diffData = diffData;
            }
        }
        let queueItem;
        while ((queueItem = queue.shift())) {
            const { thisArg, diffData, callbacks } = queueItem;
            let callback;
            if (callbacks.length > 0) {
                callback = () => {
                    let cb;
                    while ((cb = callbacks.shift())) {
                        cb();
                    }
                };
            }
            if (diffData) {
                thisArg.setData(diffData, callback);
            }
            else if (callback) {
                callback();
            }
        }
    }
}
var batchUpdates = new BatchUpdates();

function subscription(thisArg, mapState) {
    const { store } = getProvider();
    let prevState = store.getState();
    const listener = () => {
        const currState = store.getState();
        let ownStateChanges = null;
        if (isArray(mapState)) {
            for (let i = 0, len = mapState.length; i < len; i++) {
                const key = mapState[i];
                if (currState[key] !== prevState[key]) {
                    if (!ownStateChanges) {
                        ownStateChanges = {};
                    }
                    ownStateChanges[key] = currState[key];
                }
            }
        }
        else {
            ownStateChanges = mapState(currState);
        }
        if (ownStateChanges) {
            batchUpdates.push(thisArg, ownStateChanges);
        }
        prevState = currState;
    };
    return store.subscribe(listener);
}

function connect({ type = 'page', mapState, mapDispatch, manual, } = {}) {
    const { namespace, manual: manualDefaults, lifetimes } = getProvider();
    if (type && type !== 'page' && type !== 'component') {
        throw new Error('type 属性只能是 page 或 component');
    }
    if (typeof manual !== 'boolean') {
        manual = manualDefaults;
    }
    return function processOption(options) {
        const isPage = type === 'page';
        options.$type = type;
        if (mapState) {
            const ownState = handleMapState(mapState);
            if (ownState) {
                const [onLoadKey, onUnloadKey] = lifetimes[type];
                const oldOnLoad = options[onLoadKey];
                const oldOnUnload = options[onUnloadKey];
                let unsubscribe = null;
                options.data = Object.assign(options.data || {}, namespace ? { [namespace]: ownState } : ownState);
                options[onLoadKey] = function (...args) {
                    const diffData = diff(handleMapState(mapState), (namespace ? this.data[namespace] : this.data), namespace);
                    if (!isEmptyObject(diffData)) {
                        this.setData(diffData);
                    }
                    unsubscribe = subscription(this, mapState);
                    if (oldOnLoad)
                        oldOnLoad.apply(this, args);
                };
                options[onUnloadKey] = function () {
                    if (oldOnUnload)
                        oldOnUnload.call(this);
                    if (unsubscribe) {
                        unsubscribe();
                        unsubscribe = null;
                    }
                };
            }
        }
        if (mapDispatch) {
            const target = isPage ? options : (options.methods = options.methods || {});
            handleMapDispatch(mapDispatch, target);
        }
        return manual ? options : isPage ? Page(options) : Component(options);
    };
}

const useStore = () => getProvider().store;
const useDispatch = () => getProvider().store.dispatch;

export { connect, useDispatch, useStore };
