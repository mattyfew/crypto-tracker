const express = require('express')
const app = express()
const morgan = require('morgan')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const config = require('./config')

const index = require('./routers/index')
const api = require('./routers/api')
const exchanges = require('./routers/exchanges')

mongoose.connect('mongodb://localhost:27017/cryptotracker')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

app.set('superSecret', config.secret)

app.use('/', index)
app.use('/api', api)
app.use('/exchanges', exchanges)


app.use((req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']

  if(token) {
    jwt.verify(token, app.get('superSecret'), (err, decoded) => {
        if(err) {
          return res.json({
            success: false,
            message: 'Failed to authenticate token'
          })
        } else {
          req.decoded = decoded
          next()
        }
      }
    )
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided'
    })
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log("listening on port " + PORT)
})
