const express = require('express');
const app = express();
const server = require('http').createServer(app);
// const io = require('socket.io')(server);
const axios = require('axios')
const dotenv = require('dotenv')
const youtubeRoutes = require('./routes/youtube')
const instagramRoutes = require('./routes/instagram')
const aiRoutes = require('./routes/aiSuggestions')
dotenv.config()

app.use(express.json())

app.get('/', async (req,res) => {
    res.status(200).json({"message":"This server works!1"})
})

// app.get('/twitter', async (req,res) => {

//     try {
//         const response = await axios.get('https://api.twitter.com/2/tweets/search/recent?query=%23trending',{
//             headers: {
//                 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
//             }
//         })
//         console.log(response.data)
    
//         res.status(200).json(response.data)
//     } catch (error) {
//         res.send(401).json({message: error.message})
//     }

// })

app.use('/api', youtubeRoutes);
app.use('/api', aiRoutes);
app.use('/api', instagramRoutes);


server.listen(5000, () => console.log('Server running on port 5000'));