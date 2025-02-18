const express = require('express');
const app = express();
const server = require('http').createServer(app);
const dotenv = require('dotenv')
const youtubeRoutes = require('./routes/youtube')
const instagramRoutes = require('./routes/instagram')
const aiRoutes = require('./routes/aiSuggestions')
const twitterRoutes = require('./routes/twitter')
const redditRoutes = require('./routes/reddit')
const googleTrendsRoutes = require('./routes/googleTrends')

dotenv.config()

app.use(express.json())

app.get('/', async (req,res) => {
    res.status(200).json({"message":"This server is running!"})
})

app.use('/api', youtubeRoutes, twitterRoutes, redditRoutes, aiRoutes, instagramRoutes, googleTrendsRoutes);

server.listen(5000, () => console.log('Server running on port 5000'));
