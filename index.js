const express = require('express')
const app = express()
const http = require('http')
const dotenv = require('dotenv')
const googleTrends = require('google-trends-api')

dotenv.config()

const server = http.createServer(app)




app.use('/search/reddit/', require('./routes/reddit'))
app.use('/search/googleTrends/', require('./routes/googleTrends'))

app.get('/', (req, res) => {
    res.status(200).json({"message": "welcome to server"})
})




server.listen(5000, () => {
    console.log("server is running on port 5000")
})