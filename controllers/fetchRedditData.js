const dotenv = require('dotenv')
const axios = require('axios')

dotenv.config()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const USERNAME = process.env.USERNAME
const APP_NAME = process.env.APP_NAME




let cachedToken = null
let tokenExpiry = 0
async function getRedditAccessToken() {
    const currentTime = Date.now()
    if (cachedToken && currentTime < tokenExpiry) {
        return cachedToken
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    try {
        const response = await axios.post('https://www.reddit.com/api/v1/access_token', new URLSearchParams({
            grant_type: 'client_credentials'
        }), {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': `${APP_NAME}/0.1 by ${USERNAME}`
            }
        })

        cachedToken = response.data.access_token
        tokenExpiry = Date.now() + response.data.expires_in * 1000
        return cachedToken
    } catch (error) {
        console.error("error fetching access token: ", error.message)
        throw new Error("Failed to obtain access token")
    }
}

async function fetchRedditData(keyword) {
    const token = await getRedditAccessToken()

    if (token) {
        try {
            const [postResponse, subredditResponse] = await Promise.all([
                axios.get(`https://oauth.reddit.com/search`, {
                    params: { q: keyword, limit: 15, sort: 'top', t: 'week' },
                    headers: { Authorization: `Bearer ${token}`, 'User-Agent': `pavan/0.1 by ${USERNAME}` }
                }),
                axios.get('https://oauth.reddit.com/subreddits/search', {
                    params: { q: keyword, limit: 5 },
                    headers: { Authorization: `Bearer ${token}`, 'User-Agent': `${APP_NAME}/0.1 by ${USERNAME}` }
                })
            ])

            const posts = postResponse.data.data.children.map(post => ({
                title: post.data.title,
                subreddit: post.data.subreddit,
                created_at: new Date(post.data.created_utc * 1000),
                upvotes: post.data.ups,
                downvotes: post.data.downs,
                comments: post.data.num_comments,
                url: post.data.url
            }))

            const subreddits = subredditResponse.data.data.children.map(subreddit => ({
                name: subreddit.data.display_name,
                title: subreddit.data.title,
                description: subreddit.data.public_description,
                subscribers: subreddit.data.subscribers,
                url: subreddit.data.url
            }))
    
            return { posts, subreddits }
        } catch (error) {
            console.error("error fetching posts: ", error.message)
            throw new Error("Failed to fetch Reddit data")
        }
    } else {
        console.error("token doesn't exists")
    }
}




module.exports = { fetchRedditData }