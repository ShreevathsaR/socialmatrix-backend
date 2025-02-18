const dotenv = require('dotenv')
const axios = require('axios')

dotenv.config()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const USERNAME = process.env.USERNAME
const APP_NAME = process.env.APP_NAME
const HUGGING_FACE_API = process.env.HUGGING_FACE_API




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


async function sentimentAnalysis(text) {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment',
            { inputs: [text] },
            {
                headers: { Authorization: `Bearer ${HUGGING_FACE_API}` }
            }
        )

        const sentiments = response.data[0]
        const labelMapping = {
            LABEL_0: "Negative",
            LABEL_1: "Neutral",
            LABEL_2: "Positive"
        }
        const sentimentScores = sentiments.reduce((acc, sentiment) => {
            acc[labelMapping[sentiment.label]] = sentiment.score
            return acc
        }, {})

        return {
            sentiment: labelMapping[sentiments[0].label],
            scores: sentimentScores
        }
    } catch (error) {
        console.error("error analyzing sentiment: ", error.message)
        return { sentiment: 'unknown', scores: {} }
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
                    const sentiment = await sentimentAnalysis(post.data.title)

                    let postData = {
                        title: post.data.title,
                        subreddit: post.data.subreddit,
                        createdAt: new Date(post.data.created_utc * 1000),
                        upvotes: post.data.ups,
                        downvotes: Math.round((post.data.ups / post.data.upvote_ratio) - post.data.ups),
                        upvoteRatio: post.data.upvote_ratio * 100,
                        comments: post.data.num_comments,
                        sentiment: sentiment.sentiment,
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