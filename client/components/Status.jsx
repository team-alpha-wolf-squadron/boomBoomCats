import React, {Component} from 'react'
import * as Animated from 'animated/lib/targets/react-dom'

export default class Status extends Component {

  constructor(props) {
    super(props)
    this.state = {
      anim: new Animated.Value(0),
      message: this.props.status
    }
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState({message: nextProps.status})
    Animated.sequence([
      Animated.timing(this.state.anim, {toValue: 1, duration: 500}),
      Animated.timing(this.state.anim, {toValue: 1, duration: 1000}),
      Animated.timing(this.state.anim, {toValue: 0, duration: 500})
    ]).start()
  }
  render() {
    return (
      <div>
        <Animated.div
        style={{
          transform: [
            {scale: this.state.anim},
          ]  
        }}
        >
        <h1>{this.state.message}</h1>
        </Animated.div>
        </div>
      )
    }

}