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
const dbURL = process.env.dbURL || require('../env/config.js');
const createGameState = require('./createGameState')

app.use(parser.urlencoded({extended: true}))
app.use(parser.json())
app.use(express.static(path.join(__dirname, '../static')))
app.get('*', function (request, response){
  response.redirect('/')
})

var users = {}
var roomnum = 1;
var roomUsers = {};
io.on('connection', function(socket) {
  console.log('a user connected!!!')

  socket.on('addUser', function(name) {
    users[socket.id] = name
    roomUsers[socket.id] = name
    console.log(users)
    var newRoom = `room${roomnum}`;
    socket.join(newRoom)
    let srvSockets = io.sockets.sockets
    if(Object.keys(roomUsers).length === 4){
      console.log('initializing game for room ', newRoom);
      
      createGameState( (gameState) => {
        io.to(newRoom).emit('game start', gameState, roomUsers, newRoom)
        for(var userid in roomUsers){
          delete roomUsers[userid]
        }
      } )
      roomnum++
    }
    console.log(newRoom)
    io.to(newRoom).emit('new opponent', roomUsers)

  })

  socket.on('shuffle card', function(deck, room) {
    console.log(room, ': shuffled deck! emitting to other players...')
    io.to(room).emit('shuffle deck', deck)
  })

  socket.on('future card', function(player, room) {
    console.log(room,': user saw the future!!')
    io.to(room).emit('saw future', player)
  })

  socket.on('discarded', function(updatedDiscard, newHand, room) {
    console.log(room,': everyone, time to update your discard piles')
    io.to(room).emit('update discard', updatedDiscard, newHand)
  })

  socket.on('drew card', function(newDeck, newHand, room) {
    console.log(room,': heard drew card socket from client')
    io.to(room).emit('update deck', newDeck, newHand)
  })

  socket.on('attack card', function(newTurns, newBombCount, room) {
    console.log(room, ': heard a player got attacked. update it boiz')
    io.to(room).emit('update turn', newTurns, newBombCount)
  })

  socket.on('skip turn', function(room) {
    console.log(room, ': player skipped.')
    io.to(room).emit('turn skipped')
  })

  socket.on('ended turn', function(newTurns, newBombCount, room) {
    console.log(room, ': WE ENDED THE TURN THIS IS FROM THE SERVER :::: ', newTurns)
    io.to(room).emit('update turn', newTurns, newBombCount)
  })

  socket.on('less bomb', function(room) {
    io.to(room).emit('bomb less')
  })

  socket.on('player died', function(room, newBombCount) {
    io.to(room).emit('update bombCount', newBombCount)
  })

  socket.on('game over', function(room) {
    io.to(room).emit('winner found')
  })

  socket.on('chat message', function(msg, room) {
    io.to(room).emit('chat message', msg, users[socket.id])
  })

  socket.on('disconnect', function() {
    console.log('a user disconnected....')
    delete users[socket.id]
    if(roomUsers[socket.id]){
      delete roomUsers[socket.id]
    }
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