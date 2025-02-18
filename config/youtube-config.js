const { google } = require('googleapis');
const dotenv = require('dotenv')

dotenv.config();

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
})

module.exports = { youtube }
