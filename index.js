const express = require('express')
const http = require('http')
const dotenv = require('dotenv')

const app = express()

dotenv.config()

const server = http.createServer(app)




app.use('/api/reddit/', require('./routes/reddit'))
app.use('/api/googleTrends/', require('./routes/googleTrends'))
app.use('/api/twitter/', require('./routes/twitter'))




app.get('/', (req, res) => {
    res.status(200).json({ "message": "welcome to server" })
})

server.listen(5000, () => {
    console.log("server is running on port 5000")
})