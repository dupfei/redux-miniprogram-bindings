const target =  wx ;
const lifetimes =  { page: ['onLoad', 'onUnload'], component: ['attached', 'detached'] }
    ;

const isArray = Array.isArray;
const isFunction = (value) => typeof value === 'function';
const _toString = Object.prototype.toString;
const isPlainObject = (value) => _toString.call(value) === '[object Object]';
const getType = (value) => _toString.call(value);
const getKeys = Object.keys;
const isEmptyObject = (value) => getKeys(value).length < 1;
const warn = (message) => {
    throw new Error(message);
};

function setProvider(config) {
    if (!isPlainObject(config)) {
        warn('provider必须是一个Object');
    }
    const { store, namespace = '', manual = false } = config;
    if (!store) {
        warn('store必须为Redux的Store实例对象');
    }
    target.$$provider = { store, namespace, manual };
}
function getProvider() {
    if (!target.$$provider) {
        warn('请先设置provider');
    }
    return target.$$provider;
}

let updateDeps = [];
function defineReactive(state) {
    const stateKeys = getKeys(state);
    for (let i = 0, l = stateKeys.length; i < l; i++) {
        const key = stateKeys[i];
        const descriptor = Object.getOwnPropertyDescriptor(state, key);
        if (descriptor && descriptor.configurable === false) {
            throw new Error('Function 类型的 mapState 需要使用 defineProperty 进行依赖收集，请勿将 configurable 属性定义为 false');
        }
        const _getter = descriptor && descriptor.get;
        if (_getter && _getter.__ob__) {
            continue;
        }
        const _setter = descriptor && descriptor.set;
        let value = state[key];
        const getter = () => {
            if (updateDeps.indexOf(key) < 0) {
                updateDeps.push(key);
            }
            return _getter ? _getter.call(state) : value;
        };
        getter.__ob__ = true;
        const setter = (newVal) => {
            if (_getter && !_setter)
                return;
            if (_setter) {
                _setter.call(state, newVal);
            }
            else {
                value = newVal;
            }
        };
        Object.defineProperty(state, key, {
            configurable: true,
            enumerable: true,
            get: getter,
            set: setter,
        });
    }
}
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
function handleMapStateFunction(mapState, collectDeps) {
    const state = getProvider().store.getState();
    if (collectDeps) {
        updateDeps = [];
        defineReactive(state);
    }
    const ownState = mapState(state);
    if (!isPlainObject(ownState)) {
        throw new Error('mapState 函数必须返回一个对象');
    }
    return [isEmptyObject(ownState) ? null : ownState, collectDeps ? [...updateDeps] : null];
}
function handleMapState(mapState, collectDeps = false) {
    if (isArray(mapState)) {
        return [handleMapStateArray(mapState), collectDeps ? [...mapState] : null];
    }
    if (isFunction(mapState)) {
        return handleMapStateFunction(mapState, collectDeps);
    }
    return [null, null];
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

let subscriptionCount = 0;
let emitSubscriptionCount = 0;
function subscription(thisArg, mapState, updateDeps) {
    subscriptionCount += 1;
    const { store } = getProvider();
    let prevState = store.getState();
    const listener = () => {
        emitSubscriptionCount += 1;
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
            for (let i = 0, l = updateDeps.length; i < l; i++) {
                const key = updateDeps[i];
                if (currState[key] !== prevState[key]) {
                    ownStateChanges = mapState(currState);
                    break;
                }
            }
        }
        if (ownStateChanges) {
            batchUpdates.push(thisArg, ownStateChanges);
        }
        prevState = currState;
        if (emitSubscriptionCount === subscriptionCount) {
            emitSubscriptionCount = 0;
            batchUpdates.exec();
        }
    };
    const unsubscribe = store.subscribe(listener);
    return () => {
        subscriptionCount -= 1;
        unsubscribe();
    };
}

function connect({ type = 'page', mapState, mapDispatch, manual, } = {}) {
    const { namespace, manual: manualDefaults } = getProvider();
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
            const [ownState, updateDeps] = handleMapState(mapState, true);
            if (ownState) {
                const [onLoadKey, onUnloadKey] = lifetimes[type];
                const oldOnLoad = options[onLoadKey];
                const oldOnUnload = options[onUnloadKey];
                let unsubscribe = null;
                options.data = Object.assign(options.data || {}, namespace ? { [namespace]: ownState } : ownState);
                options[onLoadKey] = function (...args) {
                    const diffData = diff(handleMapState(mapState, false)[0], (namespace ? this.data[namespace] : this.data), namespace);
                    if (!isEmptyObject(diffData)) {
                        this.setData(diffData);
                    }
                    unsubscribe = subscription(this, mapState, updateDeps);
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
const $page = (config = {}) => connect(Object.assign(Object.assign({}, config), { type: 'page' }));
const $component = (config = {}) => connect(Object.assign(Object.assign({}, config), { type: 'component' }));

const useStore = () => getProvider().store;
const useState = () => getProvider().store.getState();
const useDispatch = () => {
    const { store } = getProvider();
    return store.dispatch.bind(store);
};

export { $component, $page, connect, setProvider, useDispatch, useState, useStore };
