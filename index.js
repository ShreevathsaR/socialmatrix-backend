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
const prisma = require('./config/prisma-client')
const authRoutes = require('./routes/auth')
const cors = require('cors')
const session = require('express-session');
const passport = require('passport');

require('./config/passport-google')();
require('./config/passport-local')();

dotenv.config()

app.use(express.json());
app.use(cors());

app.get('/', async (req,res) => {
    res.status(200).json({"message":"This server is running!"})
})


async function main() {
    const users = await prisma.user.findMany();
    console.log('Database connected successfully');
}

main().catch((e) => {
    console.error(e);
    prisma.$disconnect();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', youtubeRoutes, twitterRoutes, redditRoutes, aiRoutes, instagramRoutes, googleTrendsRoutes);
app.use('/auth', authRoutes)

server.listen(5000, () => console.log('Server running on port 5000'));
