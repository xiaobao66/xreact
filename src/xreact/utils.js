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
function isEventName(name) {
    return /^on[A-Z]/.test(name);
}

export {
    typeNumber,
    isEventName
}