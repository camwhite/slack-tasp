'use strict'

const app = require('express')()
const chalk = require('chalk')
const { existsSync } = require('fs')
const { createServer } = require('http')
const { Sheet, Bot } = require('./utils')

if (existsSync('./tokens.json')) {
  const tokens = require('./tokens.json')

  const sheet = new Sheet({ tokens })
  //const bot = new Bot(sheet)
}

const port = process.env.PORT || 3333
app.set('port', port)

app.get('/oauth/callback', (req, res) => {
  const { code } = req.query
  const sheet = new Sheet({ code })
  //const bot = new Bot(sheet)
  res.send('Authorization Success!')
})

const httpServer = createServer(app)
httpServer.on('error', (err) => {
  console.error(err)
})
httpServer.on('listening', () => {
  console.log(chalk.blue(`Express server is listening on ${httpServer.address().port}`))
})

httpServer.listen(port)
