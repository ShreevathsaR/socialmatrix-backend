const express = require('express')
const { getTweets } = require('../controllers/fetchTwitterData')

const router = express.Router()




router.get('/twitter/:keyword', async (req, res) => {
    const keyword = req.params.keyword
    const filter = {
        since: "2024-12-01",
        until: "2025-02-14",
    }

    try {
        const data = await getTweets(keyword, filter)
        if (data.length > 0) {
            res.status(200).json(data)
        } else {
            res.status(404).json({ error: "No tweets found" })
        }
    } catch (error) {
        console.error("Error fetching data:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})


//Official Twitter API
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




module.exports = router