const express = require('express')
const { fetchRedditData } = require('../controllers/fetchRedditData')

const router = express.Router()




router.get('/:keyword', async (req, res) => {
    const keyword = req.params.keyword

    try {
        const data = await fetchRedditData(keyword)

        if (data) {
            res.status(200).json(data)
        } else {
            res.status(404).json({ error: "no results found" })
        }
    } catch (error) {
        console.error("error fetching data: ", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})




module.exports = router