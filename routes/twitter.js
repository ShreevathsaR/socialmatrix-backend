const express = require('express')
const { getTweets } = require('../controllers/fetchTwitterData')

const router = express.Router()




router.get('/:keyword', async (req, res) => {
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




module.exports = router