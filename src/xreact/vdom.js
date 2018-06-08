import { mapProps } from './mapProps'
import { typeNumber } from './utils'
import { Vnode as VnodeClass, flattenChildren } from './createElement'

/**
 * ReactDOM.render函数入口
 * @param Vnode
 * @param container
 * @returns {*}
 */
function renderByxreact (Vnode, container) {
    const {
        type,
        props
    } = Vnode;

    if (!type) return;
    const { children } = props;

    let domNode;
    const VnodeType = typeof type;

    if (VnodeType === 'function') {
        domNode = mountComponent(Vnode, container);
    } else if (VnodeType === 'string' && type === '#text') {
        domNode = mountTextComponent(Vnode, container);
    } else {
        domNode = document.createElement(type);
    }

    // 为元素添加props
    mapProps(domNode, props, Vnode);

    if (VnodeType !== 'function') {
        // 递归挂载子节点，如果是虚拟组件，则不需要额外渲染它的子组件，只需要等它渲染完后，再根据它的render函数渲染
        if (typeNumber(children) > 2 && children !== undefined) {
            let newChildren = mountChildren(children, domNode); // flatten之后的children需要保存下来
            props.children = newChildren
        }
    }

    Vnode._hostNode = domNode; // 缓存真实的DOM

    if (container && domNode && container.nodeName !== '#text') {
        container.appendChild(domNode)
    }

    // 返回真实DOM，供其他函数调用时作为父节点使用
    return domNode;
}

function mountChildren (childrenVnode, parentDom) {
    const childType = typeNumber(childrenVnode);
    let flattenChildList = childrenVnode;

    if (childrenVnode === undefined) {
        flattenChildList = flattenChildren(childrenVnode)
    } else if (childType === 8 && childrenVnode !== undefined) {
        // Vnode
        flattenChildList = flattenChildren(childrenVnode);
        if (typeNumber(childrenVnode.type) === 5) {
            flattenChildList._hostNode = renderByxreact(flattenChildList, parentDom)
        } else if (typeNumber(childrenVnode.type) === 3 || typeNumber(childrenVnode.type) === 4) {
            flattenChildList._hostNode = mountNativeElement(flattenChildList, parentDom)
        }
    } else if (childType === 7) {
        // list
        flattenChildList = flattenChildren(childrenVnode);
        flattenChildList.forEach((child) => {
            if (child) {
                if (typeof child.type === 'function') {
                    // 如果是组件先不渲染子嗣
                    mountComponent(child, parentDom)
                } else {
                    renderByxreact(child, parentDom)
                }
            }
        })
    } else if (childType === 4 || childType === 3) {
        // string or number
        flattenChildList = flattenChildren(childrenVnode);
        mountTextComponent(flattenChildList, parentDom);
    }
    return flattenChildList
}

/**
 * 挂载组件
 * @param Vnode
 * @param container
 * @returns {*}
 */
function mountComponent (Vnode, container) {
    const Component = Vnode.type;
    const { props, key } = Vnode;
    const instance = new Component(props);
    Vnode._instance = instance;

    let renderedVnode = instance.render();
    const renderedType = typeNumber(renderedVnode);

    // 虚拟组件渲染出来的是数组，则递归挂载children
    if (renderedType === 7) {
        renderedVnode = mountChildren(renderedVnode, container)
    }
    if (renderedType === 3 || renderedType === 4) {
        renderedVnode = new VnodeClass('#text', renderedVnode, null, null)
    }
    // 未在render方法中返回jsx
    if (renderedVnode === undefined) {
        return
    }
    renderedVnode = renderedVnode || new VnodeClass('#text', '', null, null);
    renderedVnode.key = key || null;
    instance.Vnode = renderedVnode;

    let domNode = null;
    if (renderedType !== 7) {
        domNode = renderByxreact(renderedVnode, container);
    } else {
        domNode = renderedVnode[0]._hostNode
    }

    Vnode._hostNode = domNode;
    instance.Vnode._hostNode = domNode;

    return domNode;
}

/**
 * 挂载文本节点
 * @param Vnode
 * @param container
 * @returns {Text}
 */
function mountTextComponent (Vnode, container) {
    const textDom = document.createTextNode(Vnode.props);
    container.appendChild(textDom);
    Vnode._hostNode = textDom;
    return textDom
}

/**
 * 挂载原生节点
 * @param Vnode
 * @param container
 * @returns {*}
 */
function mountNativeElement (Vnode, container) {
    const domNode = renderByxreact(Vnode, container);
    Vnode._hostNode = domNode;
    return domNode
}

export const render = renderByxreact;