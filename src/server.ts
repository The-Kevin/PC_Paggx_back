import express from 'express'
import cors from 'cors'
import routes from './routes/index'

const PORT = process.env.PORT || 8080
const server = express()

server.use(express.json());
server.use(cors())
server.use(routes)


server.listen(PORT, () => {
    console.log(`The server is running on ${PORT} port\n`)
})