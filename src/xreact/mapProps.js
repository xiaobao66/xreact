import { isEventName } from './utils'

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

const mappingStrategy = {
    style: function (domNode, style) {
        if (style !== undefined) {
            Object.keys(style).forEach(styleName => {
                domNode.style[styleName] = style[styleName]
            })
        }
    },
    event: function (domNode, eventCallback, eventName) {
        /**
         * Todo 事件处理
         */
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

export {
    mapProps,
    mappingStrategy
}