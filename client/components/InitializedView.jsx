import React from 'react';
import Opponents from './Opponents.jsx'
import Player from './Player.jsx'
import Deck from './Deck.jsx'
import DiscardPile from './DiscardPile.jsx'

const InitializedView = (props) => {
  // console.log('ATTN: hitting the initilized view')
  // console.log('these are the props of the Initialized View', props)
  //var deathChance = Math.round((props.exploderCount / props.deck.length) * 100)
  return (
    <div className='gameTable'>
      {console.log(`props.exploderCount ${props.exploderCount} and props.deck.length ${props.deck.length}`)}
      <Opponents opponents={props.opponents} opponentsUsernames={props.opponentsUsernames} currentPlayerTurn={props.currentPlayerTurn} />
      <div className="row text-center">
        <Deck deck={props.deck} isPlayerTurn={props.isPlayerTurn} handleDeckClick={props.handleDeckClick}/>
        <DiscardPile discard={props.discard}/>
        {props.gameOver ? <h3 id='winner'>{props.winner} is the winner!</h3> : <h3 id='calculation'>You have a {Math.round((props.exploderCount / props.deck.length) * 100)}% chance of blowing up!</h3>}
      </div>
        <Player 
          isPlayerTurn={props.isPlayerTurn} 
          player={props.player} 
          handleCardClick={props.handleCardClick}
          socket={props.socket}
        />
    </div>
  );
};

export default InitializedView;