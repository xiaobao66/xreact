import React from './xreact'
import Portrait from './components/Portrait'
import './App.scss'

class App extends React.Component {
    constructor (props) {
        super(props)
    }

    render () {
        return (
            <Portrait></Portrait>
        )
    }
}

export default App