import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

// class App extends React.Component {
//     constructor (props) {
//         super(props);
//
//         this.state = {
//             color: ''
//         };
//
//         setInterval(() => {
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

ReactDOM.render(
    <App className={'app-container'} name={'xiaobao'}></App>,
    document.getElementById('app')
)