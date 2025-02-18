const router = require('express').Router()
const { getDailyTrends } = require('../controllers/fetchGoogleTrends')




router.get('/googleTrends/:region', async (req, res) => {
    const region = req.params.region

    try {
        const data = await getDailyTrends(region)

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