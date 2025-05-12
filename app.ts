import http from "http"
import cors from "cors"
import express from 'express'
import usersRouter from './routes/usersRouter'
const app = express()

const port = 3000

const server = http.createServer(app)

app.use(cors({ origin: "http://localhost:5173" }))
app.use('/users', usersRouter)
app.use(express.static('./public'))
app.use((req, res) => {res.status(404).send("<h2>Not found</h2>")})
server.listen(port, () => { console.log(`http://localhost:${port}`)})

// const WebSocket = require("ws")
// import wsRouter from "./routes/wsRouter.js"
// const wsServer = new WebSocket.Server({ server })
// wsServer.on("connection", wsRouter)