const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const path = require('path')

const dbURL = process.env.dbURL || require(path.join(__dirname, '../env/config.js'));

const normals = require('./cards/normals.json')
const diffuses = require('./cards/diffuses.json')
const bombs = require('./cards/bombs.json')

MongoClient.connect(dbURL, (err, db) => {
  if (err) { return console.log('unable to seed database') }
  console.log(`1: flushing database`)
  removeCards(db, () => {
    console.log(`2: finding cards`)
    findCards(db, () => {
      console.log(`3: inserting normals`)
      insertCards(db, normals, () => {
        console.log(`4: finding normals`)
        findCards(db, () => {
          console.log(`5: inserting diffuses`)
          insertCards(db, diffuses, () => {
            console.log(`6: finding normals and diffuses`)
            findCards(db, () => {
              console.log(`7: inserting bombs`)
              insertCards(db, bombs, () => {
                console.log(`8: finding full deck`)
                findCards(db, () => {
                  console.log(`9: database has been seeded`)
                  db.close()
                }) 
              })
            })
          })
        })
      })
    })
  })
})

const insertCards = (db, cardType, callback) => {
  cards = db.collection('cards')
  cards.insertMany(cardType, (err, cards) => {
    assert.equal(err, null)
  });
  callback(cards);
}

const findCards = (db, callback) => {
  cards = db.collection('cards')
  cards.find({}).toArray((err, cards) => {
    assert.equal(err, null)
    console.log(`There are ${cards.length} cards in the database`)
    callback(cards)
  });
}

const removeCards = (db, callback) => {
  cards = db.collection('cards')
  cards.deleteMany({}, (err, cards) => {
    assert.equal(err, null)
    callback(cards)
  })
}