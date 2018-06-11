import { isEventName, options } from './utils'

/**
 * 将虚拟节点的属性映射到真实DOM
 * @param domNode
 * @param props
 * @param Vnode
 */
function mapProps (domNode, props, Vnode) {
    if (Vnode && typeof Vnode.type === 'function') {
        // 如果虚拟DOM是组件，则不需要map它的props
        return;
    }

    for (let propName in props) {
        if (propName === 'children') continue;
        if (isEventName(propName)) {
            const eventName = propName.slice(2).toLowerCase();
            mappingStrategy['event'](domNode, props[propName], eventName);
            continue;
        }
        if (typeof mappingStrategy[propName] === 'function') {
            mappingStrategy[propName](domNode, props[propName]);
            continue;
        }
        if (mappingStrategy[propName] === undefined) {
            mappingStrategy['otherProps'](domNode, props[propName], propName)
        }

    }
}

let registedEvent = {};

function addEvent (domNode, fn, eventName) {
    if (domNode.addEventListener) {
        domNode.addEventListener(
            eventName,
            fn,
            false
        );

    } else if (domNode.attachEvent) {
        domNode.attachEvent("on" + eventName, fn);
    }
}

function dispatchEvent (event) {
    const path = getEventPath(event);
    options.async = true;
    // 触发event默认以冒泡形式
    triggerEventByPath(event, path);
    options.async = false;
    for (let dirty in options.dirtyComponent) {
        options.dirtyComponent[dirty].updateComponent()
    }
    options.dirtyComponent = {}//清空
}

function getEventPath (event) {
    let path = [];
    let begin = event.target;

    while (1) {
        if (begin._events) {
            path.push(begin)
        }
        begin = begin.parentNode;
        if (!begin) {
            break
        }
    }
    return path
}

function triggerEventByPath (e, path) {
    const thisEvenType = e.type;
    for (let i = 0; i < path.length; i++) {
        const events = path[i]._events;
        for (let eventName in events) {
            let fn = events[eventName];
            if (typeof fn === 'function' && thisEvenType === eventName) {

                fn.call(path[i], e)//触发回调函数默认以冒泡形式
            }
        }
    }
}

const mappingStrategy = {
    style: function (domNode, style) {
        if (style !== undefined) {
            Object.keys(style).forEach(styleName => {
                domNode.style[styleName] = style[styleName]
            })
        }
    },
    event: function (domNode, eventCallback, eventName) {
        let events = domNode._events || {};
        events[eventName] = eventCallback;
        domNode._events = events;

        if (!registedEvent[event]) {
            registedEvent[eventName] = 1;

            addEvent(document, dispatchEvent, eventName)
        }
    },
    className: function (domNode, className) {
        if (className !== undefined) {
            domNode.className = className
        }
    },
    otherProps: function (domNode, propValue, propName) {
        if (propValue !== undefined || propName !== undefined) {
            domNode[propName] = propValue
        }
    }
};

function updateProps (oldProps, newProps, Vnode) {
    for (let name in oldProps) {
        //修改原来有的属性
        if (name === 'children') continue;

        if (oldProps[name] !== newProps[name]) {
            mapProps(Vnode._hostNode, newProps, Vnode)
        }
    }

    let restProps = {};
    for (let newName in newProps) {
        //新增原来没有的属性
        if (oldProps[newName] === undefined) {
            restProps[newName] = newProps[newName]
        }
    }
    mapProps(Vnode._hostNode, restProps, Vnode)
}

export {
    mapProps,
    mappingStrategy,
    updateProps
}