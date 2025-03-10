const express = require('express');
const app = express();
const server = require('http').createServer(app);
const dotenv = require('dotenv')
const youtubeRoutes = require('./routes/youtube')
const instagramRoutes = require('./routes/instagram')
const aiRoutes = require('./routes/aiSuggestions')
const twitterRoutes = require('./routes/twitter')
const redditRoutes = require('./routes/reddit')
const googleTrendsRoutes = require('./routes/googleTrends');
const sequelize = require('./config/sequelize');

dotenv.config()

app.use(express.json())

app.get('/', async (req,res) => {
    res.status(200).json({"message":"This server is running!"})
})

sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL using Sequelize! 🚀'))
  .catch(err => console.error('Failed to connect:', err));

app.use('/api', youtubeRoutes, twitterRoutes, redditRoutes, aiRoutes, instagramRoutes, googleTrendsRoutes);

server.listen(5000, () => console.log('Server running on port 5000'));
