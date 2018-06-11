const __type = Object.prototype.toString;
const numberMap = {
    //null undefined IE6-8这里会返回[object Object]
    "[object Boolean]": 2,
    "[object Number]": 3,
    "[object String]": 4,
    "[object Function]": 5,
    "[object Symbol]": 6,
    "[object Array]": 7
};

let options = {
    async: false,
    dirtyComponent: {}
};

function typeNumber (data) {
    if (data === null) {
        return 1;
    }
    if (data === undefined) {
        return 0;
    }

    return numberMap[__type.call(data)] || 8
}

/**
 * 判断是否是事件
 * @param name
 * @returns {boolean}
 */
function isEventName (name) {
    return /^on[A-Z]/.test(name);
}

/**
 * 对比新旧节点
 * @param pre
 * @param next
 * @returns {boolean}
 */
function isSameVnode (pre, next) {
    if (pre.type === next.type && pre.key === next.key) {
        return true
    }
    return false
}

function mapKeyToIndex (old) {
    let vnodeMap = {};
    old.forEach((el, index) => {
        if (el.key) {
            vnodeMap[el.key] = index
        }
    });
    return vnodeMap
}

export {
    typeNumber,
    isEventName,
    options,
    isSameVnode,
    mapKeyToIndex
}