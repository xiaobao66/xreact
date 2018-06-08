import { createElement } from './createElement'
import { ReactClass } from './component'
import { render } from './vdom'

const React = {
    createElement,
    render,
    Component: ReactClass
};

export default React