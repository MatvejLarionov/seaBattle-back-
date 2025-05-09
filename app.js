const http = require("http")
const cors = require("cors")
const WebSocket = require("ws")
const express = require('express')
const app = express()

const usersRouter = require('./routes/usersRouter.js')
const wsRouter = require("./routes/wsRouter.js")
const port = 3000

const server = http.createServer(app)
const wsServer = new WebSocket.Server({ server })

app.use(cors({ origin: "http://localhost:5173" }))
app.use('/users', usersRouter)
app.use(express.static('./public'))
app.use((req, res) => res.status(404).send("<h2>Not found</h2>"))
server.listen(port, () => { console.log(`http://localhost:${port}`)})

wsServer.on("connection", wsRouter)