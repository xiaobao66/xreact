import { mapProps, updateProps } from './mapProps'
import { typeNumber, isSameVnode, mapKeyToIndex, options } from './utils'
import { Vnode as VnodeClass, flattenChildren } from './createElement'
import { disposeVnode } from './dispose'
import { COM_LIFE_CYCLE } from './component'

function instanceProps (componentVnode) {
    return {
        oldState: componentVnode._instance.state,
        oldProps: componentVnode._instance.props,
        oldVnode: componentVnode._instance.Vnode
    }
}

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

/**
 * 挂载children
 * @param childrenVnode
 * @param parentDom
 * @returns {*}
 */
function mountChildren (childrenVnode, parentDom) {
    const childType = typeNumber(childrenVnode);
    let flattenChildList = childrenVnode;

    if (childrenVnode === undefined) {
        flattenChildList = flattenChildren(childrenVnode)
    } else if (childType === 8) {
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

    // 生命周期
    if (instance.componentWillMount) {
        instance.componentWillMount()
        let newState = instance.state;
        instance._pendingState.forEach(partialState => {
            if (typeNumber(partialState.partialNewState) === 5) {
                newState = Object.assign({}, newState, partialState.partialNewState(oldState, newProps))
            } else {
                newState = {
                    ...newState,
                    ...partialState.partialNewState
                }
            }
        });
        instance.state = newState;
    }

    let renderedVnode = instance.render();
    const renderedType = typeNumber(renderedVnode);

    /**TODO
     * 支持直接返回数组
     */

    if (renderedType === 3 || renderedType === 4) {
        renderedVnode = new VnodeClass('#text', renderedVnode, null, null)
    }
    // 未在render方法中返回jsx
    if (renderedVnode === undefined) {
        return
    }

    // 如果什么都没有，则返回文本节点
    renderedVnode = renderedVnode || new VnodeClass('#text', '', null, null);
    renderedVnode.key = key || null;
    instance.Vnode = renderedVnode;

    let domNode = renderByxreact(renderedVnode, container);

    Vnode._hostNode = domNode;
    instance.Vnode._hostNode = domNode;

    if (instance.componentDidMount) {
        //Mounting变量用于标记组件是否正在挂载
        //如果正在挂载，则所有的setState全部都要合并
        instance.lifeCycle = COM_LIFE_CYCLE.MOUNTING;
        instance.componentDidMount();
        instance.componentDidMount = null;//防止用户调用
        instance.lifeCycle = COM_LIFE_CYCLE.MOUNTED;
    }

    instance._updateInLifeCycle();

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

export function update (oldVnode, newVnode, parentDom) {
    newVnode._hostNode = oldVnode._hostNode;

    if (oldVnode.type === newVnode.type) {
        /**TODO
         * 支持节点是数组
         */

        if (oldVnode.type === '#text') {
            // 文本节点
            updateText(oldVnode, newVnode);
            return newVnode
        }

        if (typeNumber(oldVnode.type) === 4) {
            // 原生节点
            updateProps(oldVnode.props, newVnode.props, newVnode);
            // 更新newVnode的子节点
            newVnode.props.children = updateChild(oldVnode.props.children, newVnode.props.children, newVnode._hostNode)
        }

        if (typeNumber(oldVnode.type) === 5) {
            // 组件
            updateComponent(oldVnode, newVnode, parentDom);
            newVnode._instance = oldVnode._instance;
            newVnode.key = oldVnode.key;
            newVnode.ref = oldVnode.ref;
        }
    } else {
        /**TODO
         * 支持直接返回数组
         */
        const dom = renderByxreact(newVnode, parentDom);
        if (typeNumber(newVnode.type) !== 5) {
            newVnode._hostNode = dom;
            parentDom.insertBefore(dom, oldVnode._hostNode);
            disposeVnode(oldVnode)
        }
    }

    return newVnode
}

function updateChild (oldVnodeChildren, newVnodeChildren, parentDom) {
    newVnodeChildren = flattenChildren(newVnodeChildren);
    oldVnodeChildren = oldVnodeChildren || [];
    if (typeNumber(oldVnodeChildren) !== 7) oldVnodeChildren = [oldVnodeChildren];
    if (typeNumber(newVnodeChildren) !== 7) newVnodeChildren = [newVnodeChildren];

    let oldLength = oldVnodeChildren.length,
        newLength = newVnodeChildren.length,
        oldStartIndex = 0,
        newStartIndex = 0,
        oldEndIndex = oldLength - 1,
        newEndIndex = newLength - 1,
        oldStartVnode = oldVnodeChildren[0],
        newStartVnode = newVnodeChildren[0],
        oldEndVnode = oldVnodeChildren[oldEndIndex],
        newEndVnode = newVnodeChildren[newEndIndex],
        vnodeMap;

    if (newLength > 0 && oldLength === 0) {
        newVnodeChildren.forEach((newVnode, index) => {
            renderByxreact(newVnode, parentDom);
            newVnodeChildren[index] = newVnode
        });

        return newVnodeChildren
    }

    if (newLength === 0 && oldLength > 0) {
        oldVnodeChildren.forEach(oldVnode => {
            disposeVnode(oldVnode)
        });

        return newVnodeChildren
    }

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (oldStartVnode === undefined || oldStartVnode === null) {
            oldStartVnode = oldVnodeChildren[++oldStartIndex];
        } else if (oldEndVnode === undefined || oldEndVnode === null) {
            oldEndVnode = oldVnodeChildren[--oldEndIndex];
        } else if (newStartVnode === undefined || newStartVnode === null) {
            newStartVnode = newVnodeChildren[++newStartIndex];
        } else if (newEndVnode === undefined || newEndVnode === null) {
            newEndVnode = newVnodeChildren[--newEndIndex];
        }
        if (isSameVnode(oldStartVnode, newStartVnode)) {
            update(oldStartVnode, newStartVnode, parentDom);
            oldStartVnode = oldVnodeChildren[++oldStartIndex];
            newStartVnode = newVnodeChildren[++newStartIndex];
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            update(oldEndVnode, newEndVnode, parentDom);
            oldEndVnode = oldVnodeChildren[--oldEndIndex];
            newEndVnode = newVnodeChildren[--newEndIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            const dom = oldStartVnode._hostNode;
            parentDom.insertBefore(dom, oldEndVnode._hostNode.nextSibling);
            update(oldStartVnode, newEndVnode, parentDom);
            oldStartVnode = oldVnodeChildren[++oldStartIndex];
            newEndVnode = newVnodeChildren[--newEndIndex];
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            const dom = oldEndVnode._hostNode;
            parentDom.insertBefore(dom, oldStartVnode._hostNode);
            update(oldEndVnode, newStartVnode, parentDom);
            oldEndVnode = oldVnodeChildren[--oldEndIndex];
            newStartVnode = newVnodeChildren[++newStartIndex];
        } else {
            if (vnodeMap === undefined) {
                vnodeMap = mapKeyToIndex(oldVnodeChildren)
            }
            let indexInOld = vnodeMap[newStartVnode.key];

            if (indexInOld === undefined) {
                let newElm = renderByxreact(newStartVnode, parentDom);
                parentDom.insertBefore(newElm, oldStartVnode._hostNode);
                newStartVnode = newVnodeChildren[++newStartIndex]
            } else {
                const moveVnode = oldVnodeChildren[indexInOld];
                update(moveVnode, newStartVnode, parentDom);
                parentDom.insertBefore(newStartVnode._hostNode, oldStartVnode._hostNode);
                vnodeMap[indexInOld] = undefined;
                newStartVnode = newVnodeChildren[++newStartIndex];
            }
        }
        if (oldStartIndex > oldEndIndex) {
            for (; newStartIndex <= newEndIndex; newStartIndex++) {
                if (newVnodeChildren[newStartIndex]) {
                    let newDomNode = renderByxreact(newVnodeChildren[newStartIndex], parentDom);
                    parentDom.appendChild(newDomNode);
                    newVnodeChildren[newStartIndex]._hostNode = newDomNode
                }
            }
        } else if (newStartIndex > newEndIndex) {
            for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
                if (oldVnodeChildren[oldStartIndex]) {
                    let removeNode = oldVnodeChildren[oldStartIndex];
                    if (typeNumber(removeNode._hostNode) <= 1) {
                        //证明这个节点已经被移除；
                        continue
                    }
                    disposeVnode(removeNode)
                }
            }
        }
    }

    return newVnodeChildren;
}

function updateText (oldVnode, newVnode) {
    const textDom = oldVnode._hostNode;
    if (oldVnode.props !== newVnode.props) {
        textDom.nodeValue = newVnode.props
    }
}

function updateComponent (oldComponentVnode, newComponentVnode, parentDom) {
    const {
        oldState,
        oldProps,
        oldVnode
    } = instanceProps(oldComponentVnode);

    const newProps = newComponentVnode.props;
    let newState = oldComponentVnode._instance.state;

    oldComponentVnode._instance.lifeCycle = COM_LIFE_CYCLE.PROPS_UPDATING;

    if (oldComponentVnode._instance.componentWillReceiveProps) {
        oldComponentVnode._instance.componentWillReceiveProps(newProps);
        oldComponentVnode._instance._pendingState.forEach(partialState => {
            if (typeNumber(partialState.partialNewState) === 5) {
                newState = Object.assign({}, newState, partialState.partialNewState(oldState, newProps))
            } else {
                newState = {
                    ...newState,
                    ...partialState.partialNewState
                }
            }
        });
    }

    oldComponentVnode._instance.lifeCycle = COM_LIFE_CYCLE.UPDATING;

    if (oldComponentVnode._instance.shouldComponentUpdate) {
        const shouldUpdate = oldComponentVnode._instance.shouldComponentUpdate(newProps, oldComponentVnode._instance.state);
        if (!shouldUpdate) {
            oldComponentVnode._instance.props = newProps;
        }
    }

    if (oldComponentVnode._instance.componentWillUpdate) {
        oldComponentVnode._instance.componentWillUpdate(newProps, newState);
    }

    oldComponentVnode._instance.props = newProps;
    oldComponentVnode._instance.state = newState;
    let newVnode = oldComponentVnode._instance.render();
    newVnode = newVnode || new VnodeClass('#text', '', null, null);
    const newVnodeType = typeNumber(newVnode);
    if (newVnodeType === 3 || newVnodeType === 4) {
        newVnode = new VnodeClass('#text', newVnode, null, null);
    }

    const willUpdate = options.dirtyComponent[oldComponentVnode._instance._uniqueId];
    if (willUpdate) {
        //如果这个component正好是需要更新的component，那么则更新，然后就将他从map中删除
        //不然会重复更新
        delete options.dirtyComponent[oldComponentVnode._instance._uniqueId]
    }

    update(oldVnode, newVnode, oldVnode._hostNode.parentNode);
    oldComponentVnode._hostNode = newVnode._hostNode;
    oldComponentVnode._instance.Vnode = newVnode;
    oldComponentVnode._instance.lifeCycle = COM_LIFE_CYCLE.UPDATED;

    if (oldComponentVnode._instance.componentDidUpdate) {
        oldComponentVnode._instance.componentDidUpdate(oldProps, oldState);
    }
}

export const render = renderByxreact;