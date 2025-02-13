const googleTrends = require('google-trends-api')




async function getDailyTrends(region) {
    try {
        if (!region || typeof region !== 'string') {
            throw new Error("Invalid region. Provide a valid country code (e.g., 'US', 'IN', 'GB').")
        }

        const data = await googleTrends.dailyTrends({ geo: region })
        return JSON.parse(data)
    } catch (error) {
        console.error("error fetching data: ", error)
    }
}




module.exports = { getDailyTrends }