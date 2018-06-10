import { typeNumber } from './utils'

export function disposeVnode (Vnode) {
    const { type, props } = Vnode;
    if (typeNumber(Vnode) === 7) {
        disposeChildVnode(Vnode);
        return;
    }

    if (!type) return;

    if (typeof Vnode.type === 'function') {
        if (Vnode._instance.componentWillUnmount) {
            Vnode._instance.componentWillUnmount()
        }
    }
    if (props.children) {
        disposeChildVnode(props.children)
    }
    if (Vnode._hostNode) {
        const parent = Vnode._hostNode.parentNode;
        if (parent) {
            parent.removeChild(Vnode._hostNode)
        }
    }
    Vnode._hostNode = null
}

export function disposeChildVnode (childVnode) {
    let children = childVnode;
    if (typeNumber(children) !== 7) {
        children = [children]
    }

    children.forEach(child => {
        if (typeNumber(child.type) === 5) {
            if (typeNumber(child._hostNode) <= 1) {
                // 此节点已被删除
                child._hostNode = null;
                child._instance = null;
                return;
            }

            if (child._instance.componentWillUnmount) {
                child._instance.componentWillUnmount()
            }
        }

        if (typeNumber(child) !== 4 && typeNumber(child) !== 3 && child._hostNode !== undefined) {
            const parent = child._hostNode.parentNode;
            parent.removeChild(child._hostNode);
            child._hostNode = null;
            child._instance = null;
            if (child.props.children) {
                disposeChildVnode(child.props.children)
            }
        }
    })
}