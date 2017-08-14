import React from 'react'
import Game from './Game.jsx'

export default class Opponents extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const opponentsUsernames = this.props.opponentsUsernames //should be an array of id's
    const opponents = this.props.opponents
    // console.log('these are the props of the oppenent component:', this.props)
    // console.log('the opponents are...', opponents)

    return (
      <div className="row">
        { 
          opponents.map((opp, i) => {
            // console.log('these are the opponents usernames on the opponent component', opponentsUsernames)
            return (
              <div>
              <span className="opponent col-xs-3" key={i}/*opponent={opponentsUsernames[i]} name={opponentsUsernames[i]}*/>
                <h4>Player:</h4>

                {this.props.currentPlayerTurn === opp.index ? <h3 className='oppName oppActive'>{opponentsUsernames[i]}</h3> : 
                  <h3 className='oppName'>{opponentsUsernames[i]}</h3>}

                <div className='row'>
                {
                  opp.hand.map((card, j) => (<div key={j} className="col-xs-1"><img src={'./assets/cardBack.jpg'} className='card-back img-rounded' /></div> ))
                }
                </div>
              </span>
              </div>
            )
          })
        }     
      </div>
    )
  }
}
