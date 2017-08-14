const express = require('express')
const path = require('path')
const parser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const app = express()
const PORT = process.env.PORT || 3000

const server = require('http').Server(app)
const io = require('socket.io')(server)
let db // mongo
const dbURL = process.env.dbURL //TODO: remove // for dev|| require('../env/config.js');
const createGameState = require('./createGameState')

app.use(parser.urlencoded({extended: true}))
app.use(parser.json())
app.use(express.static(path.join(__dirname, '../static')))
app.get('*', function (request, response){
  response.redirect('/')
})

var users = {}

io.on('connection', function(socket) {
  console.log('a user connected!!!')

  socket.on('addUser', function(name) {
    users[socket.id] = name
    console.log(users)

    // Detect the number of players before starting game
    let srvSockets = io.sockets.sockets
    if (Object.keys(srvSockets).length === 4) {
      console.log(`game initalized! players are ${Object.keys(srvSockets)}`)
      createGameState( (gameState) => {
        io.emit('game start', gameState, users)
      } )
    }

    io.emit('new opponent', users)

  })

  socket.on('shuffle card', function(deck) {
    console.log('shuffled deck! emitting to other players...')
    io.emit('shuffle deck', deck)
  })

  socket.on('future card', function(player) {
    console.log('user saw the future!!')
    io.emit('saw future', player)
  })

  socket.on('discarded', function(updatedDiscard, newHand) {
    console.log('everyone, time to update your discard piles')
    io.emit('update discard', updatedDiscard, newHand)
  })

  socket.on('drew card', function(newDeck, newHand) {
    console.log('heard drew card socket from client')
    io.emit('update deck', newDeck, newHand)
  })

  socket.on('attack card', function(newTurns, newBombCount) {
    console.log('heard a player got attacked. update it boiz')
    io.emit('update turn', newTurns, newBombCount)
  })

  socket.on('ended turn', function(newTurns, newBombCount) {
    console.log('WE ENDED THE TURN THIS IS FROM THE SERVER :::: ', newTurns)
    io.emit('update turn', newTurns, newBombCount)
  })

  socket.on('less bomb', function() {
    io.emit('bomb less')
  })

  socket.on('game over', function() {
    io.emit('winner found')
  })

  socket.on('chat message', function(msg) {
    io.emit('chat message', msg, users[socket.id])
  })

  socket.on('disconnect', function() {
    console.log('a user disconnected....')
    delete users[socket.id]
    console.log(users)
  })
})

MongoClient.connect(dbURL, (err, database) => {
  assert.equal(null, err);
  db = database;
  // server.listen(PORT, function() {
  //   console.log('now serving app on port ', PORT)
  // });
});

  server.listen(PORT, function() {
    console.log('now serving app on port ', PORT)
  });