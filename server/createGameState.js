const MongoClient = require('mongodb').MongoClient
const dbURL = 
  // process.env.dbURL ||
  require('../env/config')


let createGameState = function(callback) {

  MongoClient.connect(dbURL, (err, database) => {
    db = database;
    const cards = db.collection('cards')

    let gameState = {
      allPlayers: [{hand: [], index: 0},{hand: [], index: 1},{hand: [], index: 2},{hand:[], index: 3}],
      deck: [],
      discard: [],
      turn: [1, 2, 3, 4]
    }

    cards.find({type: "normal"}).toArray().then( (orderedDeck) => {
      console.log('')
      console.log(`There are ${orderedDeck.length} ${orderedDeck[0].type} cards in the database
      `)

      let shuffledDeck = []

      console.log(`Shuffling deck of cards: `)
      
      //shuffle the deck by picking a random index and add it to shuffledDeck
      while (orderedDeck.length > 0) {
        let min = 0
        let max = orderedDeck.length - 1
        let randomIndex = Math.floor(Math.random() * (max - min + 1)) + min
        shuffledDeck.push(orderedDeck[randomIndex])
        orderedDeck.splice(randomIndex, 1)
        console.log(`card at index ${shuffledDeck.length-1} is ${shuffledDeck[shuffledDeck.length-1].name}`)
      }

      //save the normal cards to the deck
      gameState.deck = shuffledDeck.slice()

      //create allPlayers starting hands, not including the initial defuse card
      for (let i = 0; i < 16; i++) {
        gameState.allPlayers[(i%4)].hand.push( gameState.deck.pop() )
      }
      
      console.log(`
      After dealing normal cards to allPlayers, there are now ${gameState.deck.length} cards in the deck. 
      Each allPlayers's starting hands currently has ${gameState.allPlayers[0].hand.length} cards.
      `)

      cards.find({type: "defuse"}).toArray().then( (defuse) => {
        console.log(`There are ${defuse.length} ${defuse[0].type} cards in the database
        `)

        //distributes defuses to four allPlayerss
        for (let i = 0; i < 4; i++) {
          gameState.allPlayers[i].hand.push(defuse.pop())
        }

        console.log(`After dealing defuse cards to allPlayers, their starting hands now has ${gameState.allPlayers[1].hand.length} cards. 
        The starting hand cards are 
        `)

        gameState.allPlayers.forEach((player,i) => player.hand.forEach( (card,ci) => {
          console.log(`player ${i} card ${ci} ${card.name}`)
        }))

        //if defuses left over, add to deck randomly
        if (defuse.length > 0) { 
            let min = 0
            let max = gameState.deck.length - 1
          for (let i = 0; i < defuse.length; i++) {
            let randomIndex = Math.floor(Math.random() * (max - min + 1)) + min
            gameState.deck.splice(randomIndex, 0, defuse.pop())
              //note doesn't ever add as last element
          }
        }

        console.log(`There are now ${gameState.deck.length} cards in the deck after defusing card initialization.        
        `)

        cards.find({type: "bomb"}).toArray().then( (bombs) => {
          console.log(`There are ${bombs.length} ${bombs[0].type} cards in the database
          `)

          let min = 0

          //insert bombs into the deck
          while (bombs.length > 0) {
            let max = gameState.deck.length
            let randomIndex = Math.floor(Math.random() * (max - min + 1)) + min
            gameState.deck.splice(randomIndex, 0, bombs.pop())

          }
          console.log(`There are now ${gameState.deck.length} cards in the deck after bomb card initialization.
          `)

          gameState.deck.forEach( (card,i) => {
            console.log(`card at index ${i} is ${card.name}`)
          })

          console.log('now in the callback portion')
          if (callback) {
            callback(gameState)
          }

        })
      })
    })
  })      
}

//createGameState()

module.exports = createGameState