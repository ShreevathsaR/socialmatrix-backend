const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

async function scrapeInstagram(keyword) {
    console.log('Starting scrape for keyword:', keyword);

    try {
        // Start the actor with the correct input parameters
        const run = await client.actor("apify/instagram-scraper").call({
            search: keyword,               // The keyword to search for
            searchType: "hashtag",         // Type of search
            searchLimit: 5,               // Maximum number of posts to scrape
            resultsType: "posts",          // Specify that we want posts
            proxy: {
                useApifyProxy: true        // Use Apify's proxy
            },
            maxRequestRetries: 3,          // Retry failed requests
            debug: true                    // Enable debug logs
        });

        console.log('Actor run started, ID:', run.id);
        
        // Wait for the dataset to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Get the results
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        console.log('Number of items retrieved:', items ? items.length : 0);
        
        if (!items || items.length === 0) {
            throw new Error('No items found in the dataset');
        }

        return items;
    } catch (error) {
        // Enhanced error logging
        console.error('Detailed error during scraping:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            actorError: error.actorError || 'No actor error',
            datasetId: error.datasetId || 'No dataset ID'
        });
        throw error;
    }
}

const instagramData = async (req, res) => {
    try {
        const { keyword } = req.body;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }

        console.log('Processing request for keyword:', keyword);
        const results = await scrapeInstagram(keyword);

        console.log('Scraping complete. Results:', results);

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No results found for the given keyword'
            });
        }

        // Results to be processed and formatted

        res.json(results);

    } catch (error) {
        console.error('Error in instagramData:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to scrape Instagram data'
        });
    }
}

module.exports = { instagramData };