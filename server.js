const express = require('express')
const basicAuth = require('express-basic-auth')

const app = express()

app.use(express.static(__dirname))

app.use('/auth', basicAuth({
  users: require('./users'),
  challenge: true,
}), (req, res) => {
  res.json(req.auth)
})

app.get('/ok', (req, res) => {
  res.end('ok')
})

app.get('/redirect', (req, res) => {
  res.redirect('/ok')
})

app.get('/delay', (req, res) => {
  setTimeout(() => {
    res.end(new Date().toString())
  }, 5000)
})

app.get('/error', (req, res) => {
  res.writeHead(500)
  res.end()
})

const server = app.listen(3000, () => {
  console.log(`Listening on ${server.address().port}.`);
})
