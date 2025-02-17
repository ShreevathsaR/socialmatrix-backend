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


async function getTopComments(postId, token) {
    try {
        const response = await axios.get(`https://oauth.reddit.com/comments/${postId}`, {
            params: { sort: 'hot' },
            headers: { Authorization: `Bearer ${token}`, 'User-Agent': `${APP_NAME}/0.1 by ${USERNAME}` }
        })

        const commentsData = response.data[1].data.children
        const topComments = commentsData.filter(comment => comment.kind === 't1').slice(0, 3).map(comment => ({
            body: comment.data.body,
            upvotes: comment.data.ups
        }))
    
        return topComments
    } catch (error) {
        console.error("error fetching top comments: ", error.message)
        return []
    }
}


async function fetchRedditData(keyword) {
    const token = await getRedditAccessToken()

    if (token) {
        try {
            const [postResponse, subredditResponse] = await Promise.all([
                axios.get(`https://oauth.reddit.com/search`, {
                    params: { q: keyword, limit: 15, sort: 'top', t: 'month' },
                    headers: { Authorization: `Bearer ${token}`, 'User-Agent': `pavan/0.1 by ${USERNAME}` }
                }),
                axios.get('https://oauth.reddit.com/subreddits/search', {
                    params: { q: keyword, limit: 5 },
                    headers: { Authorization: `Bearer ${token}`, 'User-Agent': `${APP_NAME}/0.1 by ${USERNAME}` }
                })
            ])

            const posts = await Promise.all(
                postResponse.data.data.children.map(async (post, index) => {
                    let postData = {
                        title: post.data.title,
                        subreddit: post.data.subreddit,
                        createdAt: new Date(post.data.created_utc * 1000),
                        upvotes: post.data.ups,
                        downvotes: Math.round((post.data.ups / post.data.upvote_ratio) - post.data.ups),
                        upvoteRatio: post.data.upvote_ratio * 100,
                        comments: post.data.num_comments,
                        totalInteraction: Math.round(post.data.upvotes + post.data.num_comments),
                        url: post.data.url
                    }
                    if (index < 3) {
                        postData.topComments = await getTopComments(post.data.id, token)
                    }

                    return postData
                })
            )

            const subreddits = subredditResponse.data.data.children.map(subreddit => ({
                name: subreddit.data.display_name,
                title: subreddit.data.title,
                description: subreddit.data.public_description,
                subscribers: subreddit.data.subscribers,
                url: subreddit.data.url
            }))

            //trending posts over the time
            const timeRanges = ['hour', 'day', 'week']
            const requests = timeRanges.map(time => 
                axios.get('https://oauth.reddit.com/search', {
                    params: { q: keyword, limit: 3, sort: 'top', t: time },
                    headers: { Authorization: `Bearer ${token}`, 'User-Agent': `${APP_NAME}/0.1 by ${USERNAME}` }
                }).then(response => ({
                    time: `trending posts ${time} ago`,
                    posts: response.data.data.children.map(post => ({
                        title: post.data.title,
                        upvotes: post.data.ups,
                        url: post.data.url
                    }))
                }))
            )
            const trendingPosts = await Promise.all(requests)

            return { posts, subreddits, trendingPosts }
        } catch (error) {
            console.error("error fetching posts: ", error.message)
            throw new Error("Failed to fetch Reddit data")
        }
    } else {
        console.error("token doesn't exists")
    }
}




module.exports = { fetchRedditData }