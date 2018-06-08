import { typeNumber } from './utils'

// 需要过滤的props属性
const RESERVED_PROPS = {
    ref: true,
    key: true
};

function Vnode (type, props, key, ref) {
    this.type = type;
    this.props = props;
    this.key = key;
    this.ref = ref;
}

/**
 * 创建虚拟DOM
 * @param type
 * @param config
 * @param children
 * @returns {Vnode}
 */
function createElement (type, config, ...children) {
    let props = {},
        key = null,
        ref = null,
        childLength = children.length;

    if (config !== null) {
        key = config.key === undefined ? null : config.key.toString();
        ref = config.ref === undefined ? null : config.ref;
    }

    for (let propName in config) {
        /*
        过滤config中的一些属性，比如：key、ref
         */
        if (RESERVED_PROPS.hasOwnProperty(propName)) continue;
        if (config.hasOwnProperty(propName)) {
            props[propName] = config[propName];
        }
    }

    // 将children加入props
    if (childLength === 1) {
        props.children = typeNumber(children[0]) > 2 ? children[0] : [];
    } else {
        props.children = children;
    }

    // 返回虚拟dom——Vnode
    return new Vnode(type, props, key, ref)
}

/**
 * 过滤children，主要是处理文本节点，将其转为虚拟DOM
 * @param children
 * @returns {*}
 */
function flattenChildren (children) {
    if (children === undefined) {
        return new Vnode('#text', '', null, null)
    }

    const length = children.length;
    let arr = [],
        lastString = '',
        isLastSimple = false, // 判断上一个元素是否是string 或者 number
        childType = typeNumber(children);

    if (childType === 4 || childType === 3) {
        return new Vnode('#text', children, null, null)
    }

    if (childType !== 7) {
        return children
    }

    children.forEach((child, index) => {
        const childType = typeNumber(child);
        if (childType === 7) {
            if (isLastSimple) {
                arr.push(lastString)
            }
            child.forEach(subChild => {
                arr.push(subChild)
            });
            isLastSimple = false;
            lastString = ''
        }
        if (childType === 3 || childType === 4) {
            isLastSimple = true;
            lastString += child
        }
        if (childType !== 3 && childType !== 4 && childType !== 7) {
            if (isLastSimple) {
                arr.push(lastString);
                arr.push(child);
                isLastSimple = false;
                lastString = ''
            } else {
                arr.push(child)
            }
        }
        if (length - 1 === index) {
            if (lastString) {
                arr.push(lastString)
            }
        }
    });

    return arr.map((item) => {
        if (typeNumber(item) === 4) {
            return new Vnode('#text', item, null, null)
        }
        return item
    })
}

export {
    Vnode,
    createElement,
    flattenChildren
}