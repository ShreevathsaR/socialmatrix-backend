const googleTrends = require('google-trends-api')




async function getDailyTrends(region) {
    try {
        if (!region || typeof region !== 'string') {
            throw new Error("Invalid region. Provide a valid country code (e.g., 'US', 'IN', 'GB').")
        }

        const data = await googleTrends.dailyTrends({ geo: region })
        const parsedData = JSON.parse(data)

        const trendsArr = parsedData.default.trendingSearchesDays.flatMap(day => 
            day.trendingSearches.map(search => ({
                name: search.title.query,
                url: search.articles?.[0]?.url || "no url available"
            }))
        )
        return trendsArr
    } catch (error) {
        console.error("error fetching data: ", error)
    }
}




module.exports = { getDailyTrends }