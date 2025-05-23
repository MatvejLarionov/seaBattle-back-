import http from "http"
import cors from "cors"
import express from 'express'
import usersRouter from './routes/usersRouter'
import serverConfig from "./serverConfig"
const app = express()

const server = http.createServer(app)

app.use(cors({ origin: "http://localhost:5173" }))
app.use('/users', usersRouter)
app.use(express.static('./public'))
app.use((req, res) => {res.status(404).send("<h2>Not found</h2>")})
server.listen(serverConfig.port, () => { console.log(serverConfig.url)})

// const WebSocket = require("ws")
// import wsRouter from "./routes/wsRouter.js"
// const wsServer = new WebSocket.Server({ server })
// wsServer.on("connection", wsRouter)