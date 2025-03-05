const googleTrends = require('google-trends-api')




async function getDailyTrends(region) {
    try {
        if (!region || typeof region !== 'string') {
            throw new Error("Invalid region. Provide a valid country code (e.g., 'US', 'IN', 'GB').")
        }

        console.log("Fetch trends for region:", region)

        const data = await googleTrends.dailyTrends({ geo: region });

        if (!data || !data.startsWith("{")) {
            throw new Error("Invalid response from Google Trends API. Response is not JSON.");
        }

        const parsedData = JSON.parse(data);

        const trendsArr = parsedData.default.trendingSearchesDays.flatMap(day => 
            day.trendingSearches.map(search => ({
                name: search.title.query,
                url: search.articles?.[0]?.url || "no url available"
            }))
        )
        return trendsArr;
    } catch (error) {
        console.error("Error fetching data: ", error);
        return [];
    }
}





module.exports = { getDailyTrends }