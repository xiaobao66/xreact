import { mapProps } from './mapProps'

class ReactClass {
    constructor (props) {
        this.props = props;
        this.state = this.state || {};

        // 用于更新
        this.nextState = null
    }

    setState (partialState) {
        const prevState = this.state;
        this.nextState = { ...this.state, ...partialState };
        this.state = this.nextState;

        const oldVnode = this.Vnode;
        const newVnode = this.render();

        updateComponent(this, oldVnode, newVnode)
    }

    render () {
    }
}

function updateComponent (instance, oldVnode, newVnode) {
    if (oldVnode.type === newVnode.type) {
        mapProps(oldVnode._hostNode, newVnode.props)
    } else {
        // remove
    }
}

export {
    ReactClass
}