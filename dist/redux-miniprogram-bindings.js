const target =  wx ;
const lifetimes =  { page: ['onLoad', 'onUnload'], component: ['attached', 'detached'] }
    ;

const isFunction = (value) => typeof value === 'function';
const isArray = Array.isArray;
const _toString = Object.prototype.toString;
const isPlainObject = (value) => _toString.call(value) === '[object Object]';
const getType = (value) => _toString.call(value);
const getKeys = Object.keys;
const isEmptyObject = (value) => getKeys(value).length < 1;
const hasOwnProperty = Object.prototype.hasOwnProperty;
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

const useStore = () => getProvider().store;
const useState = () => getProvider().store.getState();
const useDispatch = () => {
    const { store } = getProvider();
    return store.dispatch.bind(store);
};

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
                if (isPlainObject(funcResult) && !isEmptyObject(funcResult)) {
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
    if (!isEmptyObject(boundActionCreators)) {
        Object.assign(target, boundActionCreators);
    }
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
    push(thisArg, data) {
        const queue = this.queue;
        let queueItem;
        for (let i = 0, len = queue.length; i < len; i++) {
            if (queue[i].thisArg === thisArg) {
                queueItem = queue[i];
                break;
            }
        }
        if (!queueItem) {
            queueItem = { thisArg, data: {} };
            queue.push(queueItem);
        }
        Object.assign(queueItem.data, data);
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
            const diffData = diff(queueItem.data, ((namespace
                ? queueItem.thisArg.data[namespace]
                : queueItem.thisArg.data)), namespace);
            if (!isEmptyObject(diffData)) {
                queueItem.diffData = diffData;
            }
        }
        let queueItem;
        while ((queueItem = queue.shift())) {
            if (queueItem.diffData) {
                queueItem.thisArg.setData(queueItem.diffData);
            }
        }
    }
}
var batchUpdates = new BatchUpdates();

let trackCount = 0;
let triggerCount = 0;
function subscription(thisArg, mapState) {
    trackCount += 1;
    const store = useStore();
    let prevState = store.getState();
    const unsubscribe = store.subscribe(() => {
        triggerCount += 1;
        const currState = store.getState();
        let ownStateChanges;
        for (let i = 0, len = mapState.length; i < len; i++) {
            const curr = mapState[i];
            switch (typeof curr) {
                case 'string': {
                    if (currState[curr] !== prevState[curr]) {
                        if (!ownStateChanges) {
                            ownStateChanges = {};
                        }
                        ownStateChanges[curr] = currState[curr];
                    }
                    break;
                }
                case 'function': {
                    const funcResult = curr(currState);
                    if (isPlainObject(funcResult) && !isEmptyObject(funcResult)) {
                        if (!ownStateChanges) {
                            ownStateChanges = {};
                        }
                        Object.assign(ownStateChanges, funcResult);
                    }
                    break;
                }
            }
        }
        if (ownStateChanges) {
            batchUpdates.push(thisArg, ownStateChanges);
        }
        prevState = currState;
        if (triggerCount === trackCount) {
            triggerCount = 0;
            batchUpdates.exec();
        }
    });
    return () => {
        trackCount -= 1;
        unsubscribe();
    };
}

function connect({ type = 'page', mapState, mapDispatch, manual, } = {}) {
    if (type !== 'page' && type !== 'component') {
        warn('type属性只能是page或component');
    }
    const isPage = type === 'page';
    const { namespace, manual: manualDefaults } = getProvider();
    if (typeof manual !== 'boolean') {
        manual = manualDefaults;
    }
    return function processOption(options) {
        options.$$type = type;
        if (isArray(mapState) && mapState.length > 0) {
            const ownState = handleMapState(mapState);
            const [onLoadKey, onUnloadKey] = lifetimes[type];
            const oldOnLoad = options[onLoadKey];
            const oldOnUnload = options[onUnloadKey];
            let unsubscribe = null;
            options.data = Object.assign(options.data || {}, namespace ? { [namespace]: ownState } : ownState);
            options[onLoadKey] = function (...args) {
                const ownState = handleMapState(mapState);
                if (!isEmptyObject(ownState)) {
                    const diffData = diff(ownState, (namespace ? this.data[namespace] : this.data), namespace);
                    if (!isEmptyObject(diffData)) {
                        this.setData(diffData);
                    }
                }
                unsubscribe = subscription(this, mapState);
                if (oldOnLoad) {
                    oldOnLoad.apply(this, args);
                }
            };
            options[onUnloadKey] = function (...args) {
                if (oldOnUnload) {
                    oldOnUnload.call(this, args);
                }
                if (unsubscribe) {
                    unsubscribe();
                    unsubscribe = null;
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
const $page = (config = {}) => connect(Object.assign(Object.assign({}, config), { type: 'page' }));
const $component = (config = {}) => connect(Object.assign(Object.assign({}, config), { type: 'component' }));

export { $component, $page, connect, setProvider, useDispatch, useState, useStore };
