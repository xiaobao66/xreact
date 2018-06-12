import { mapProps } from './mapProps'
import { options, typeNumber } from './utils'
import { Vnode } from "./createElement";
import { update } from './vdom'

const COM_LIFE_CYCLE = {
    CREATE: 0, // 创建节点
    MOUNTED: 1, // 节点已经挂载
    UPDATING: 2, // 节点正在更新
    UPDATED: 3, // 节点已经更新
    MOUNTING: 4, // 节点正在挂载
    PROPS_UPDATING: 5, // 节点更新props
};

let uniqueId = 0;

class ReactClass {
    constructor (props) {
        this.props = props;
        this.state = this.state || {};

        // 用于更新
        this.nextState = null;
        this.lifeCycle = COM_LIFE_CYCLE.CREATE;
        this.stateMergeQueue = [];
        this._pendingState = [];
        this._uniqueId = uniqueId++;
    }

    updateComponent () {
        const prevState = this.state;
        const oldVnode = this.Vnode;

        this.nextState = this.state;

        for (let index = 0; index < this._pendingState.length; index++) {
            const item = this._pendingState[index];
            if (typeNumber(item.partialNewState) === 5) {
                // setState传入的是函数
                this.nextState = Object.assign({}, this.nextState, item.partialNewState(this.nextState, this.props))
            } else {
                this.nextState = Object.assign({}, this.nextState, item.partialNewState)
            }
        }

        if (this.nextState !== prevState) {
            this.state = this.nextState
        }

        // 如果自定义了shouldComponentUpdate，则判断是否要更新
        if (this.shouldComponentUpdate) {
            const shouldUpdate = this.shouldComponentUpdate(this.props, this.nextState);
            if (!shouldUpdate) {
                // 清空更新队列
                this._pendingState = [];
                return
            }
        }

        if (this.componentWillUpdate) {
            this.componentWillUpdate(this.props, this.nextState)
        }

        let newVnode = this.render();

        newVnode = newVnode || new Vnode('#text', '', null, null);
        this.Vnode = update(oldVnode, newVnode, this.Vnode._hostNode.parentNode);

        if (this.componentDidUpdate) {
            this.componentDidUpdate(this.props, prevState)
        }

        this._pendingState.forEach(item => {
            if (typeNumber(item.callback) === 5) {
                item.callback(this.state, this.props)
            }
        });

        // 清空更新队列
        this._pendingState = []

    }

    _updateInLifeCycle () {
        if (this.stateMergeQueue.length > 0) {
            let tempState = this.state;
            this._pendingState.forEach(item => {
                tempState = Object.assign({}, tempState, ...item.partialNewState)
            });

            this.nextState = { ...tempState };
            // 清空合并队列
            this.stateMergeQueue = [];
            this.updateComponent()
        }
    }

    setState (partialNewState, callback) {

        // 加入等待更新队列
        this._pendingState.push({
            partialNewState,
            callback
        });

        if (this.lifeCycle === COM_LIFE_CYCLE.CREATE) {
            // 组件创建期不做处理
        } else {
            if (this.lifeCycle === COM_LIFE_CYCLE.PROPS_UPDATING) {
                // 组件更新props阶段
                return
            }

            if (this.lifeCycle === COM_LIFE_CYCLE.MOUNTING) {
                // 组件正在挂载阶段, 推入合并队列
                this.stateMergeQueue.push(1);
                return
            }

            if (options.async === true) {
                // 在事件中调用
                let dirty = options.dirtyComponent[this._uniqueId];
                if (!dirty) {
                    options.dirtyComponent[this._uniqueId] = this
                }

                return
            }

            // 不在生命周期中调用
            this.updateComponent()
        }
    }

    // shouldComponentUpdate() { }
    componentWillReceiveProps () {
    }

    // componentWillUpdate() { }
    // componentDidUpdate() { }
    componentWillMount () {
    }

    componentDidMount () {
    }

    componentWillUnmount () {
    }

    render () {
    }
}

export {
    ReactClass,
    COM_LIFE_CYCLE
}