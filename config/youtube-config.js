const { google } = require('googleapis');
const dotenv = require('dotenv')

dotenv.config();

console.log('APIKEY', process.env.YOUTUBE_API_KEY)

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY || 'AIzaSyDpElfgc5SsG7GbJcIbpLhw4ckKMdDmlzI',
})

module.exports = { youtube }
