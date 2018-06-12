import React from 'react'
import ReactDOM from 'react-dom'
// import App from './App'

// class App extends React.Component {
//     constructor (props) {
//         super(props);
//
//         this.state = {
//             color: ''
//         };
//
//         setTimeout(() => {
//             const color = ['#eee', 'black', 'red', 'green', 'blue', 'grey', '#133234', '#123213', '222345', '998232']
//             const rand = parseInt(Math.min(10, Math.random() * 10))
//             this.setState({
//                 color: color[rand]
//             })
//         }, 1000)
//     }
//
//     render () {
//         return (
//             <div className={this.props.className} style={{
//                 width: '100px',
//                 height: '100px',
//                 background: this.state.color,
//                 color: '#fff'
//             }}>
//                 hello {this.props.name}
//             </div>
//         )
//     }
// }

class Portal extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            num: 0
        }
    }

    componentWillReceiveProps (nextProps) {
        console.log(nextProps);
        console.log(this.props);
    }

    // componentWillUpdate () {
    //     if (this.state.num < 10) {
    //         this.setState({
    //             num: this.state.num + 1
    //         })
    //     }
    // }

    onChangeNum = () => {
        this.setState(prevState => ({
            num: prevState.num + 1
        }));
        // this.setState(prevState => ({
        //     num: prevState.num + 1
        // }));
    };

    render () {
        return (
            <div>
                <p>child {this.props.name} {this.state.num}</p>
                <button onClick={this.onChangeNum}>child click</button>
            </div>
        )
    }
}

class App extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            change: false,
            name: 'xiaobaowei',
            list: [
                <p key={1}>zhang</p>,
                <a href="#" key={2}>li</a>,
                <span key={3}>wang</span>,
                <div key={4}>qian</div>
            ]
        };
    }

    componentWillMount () {
        this.setState({
            name: 'xiaobao'
        })
    }

    componentDidMount () {
        // this.setState({
        //     name: 'weixiaobao'
        // })
    }

    componentWillUpdate () {
        console.log('componentWillUpdate')
    }

    onChange = () => {
        this.setState(prevState => ({
            change: !prevState.change
        }))

        // this.setState({
        //     list: [
        //         <a key={1} href="#">li</a>,
        //         <p key={2}>zhang</p>,
        //         <div key={3}>qian</div>,
        //         <span key={4}>wang</span>
        //
        //     ]
        // })
    };

    render () {
        return (
            <div>
                <div>
                    {
                        !this.state.change ? this.state.list.map(item => item) : ''
                    }
                </div>
                <Portal change={this.state.change} name={this.state.name}></Portal>
                <button onClick={this.onChange}>click</button>
            </div>
        )
    }
}

ReactDOM.render(
    <App className={'app-container'} name={'xiaobao'}></App>,
    document.getElementById('app')
);