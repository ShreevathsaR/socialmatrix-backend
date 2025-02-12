//Ref: https://developers.google.com/youtube/v3/docs/search/list#type

const { youtube }   = require("../config/youtube-config")

const getTrendingVideos = async (keywords) => {

    console.log('Fetching trending videos...');
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const publishedAfter = oneYearAgo.toISOString();
    
    try {
        const response = await youtube.search.list({
            part: ['snippet'],
            q: keywords,
            maxResults: 10,
            type: 'video',
            order: 'relevance',
            publishedAfter: publishedAfter,
            // videoDuration: 'medium',
        })

        const videoIds = response.data.items.map(item => item.id.videoId);
        return videoIds;
    } catch (error) {
        console.log('Error fetching videos',error)
    }
}

const getVideoDetails = async (videoIds) => {
    console.log('Fetching all videos details...');
    try {
        const response = await youtube.videos.list({
            part: ['snippet', 'statistics'],
            id: videoIds.join(','),
        })

        const processedVideos = response.data.items.map(video => ({
            id: video.id,
            title: video.snippet.title,
            views: parseInt(video.statistics.viewCount),
            likes: parseInt(video.statistics.likeCount) || 0, // Some videos may not have likes
            publishedAt: video.snippet.publishedAt,
            channelTitle: video.snippet.channelTitle,
            description: video.snippet.description,
            hashtags: video.snippet.tags || [] // Extract hashtags if available
        }));

        return processedVideos;
    } catch (error) {
        console.log('Error fetching videos details',error)
    }
}

const computeInsights = (videos) => {

    console.log('Computing insights...');

    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const averageViews = Math.floor(totalViews / videos.length);
    const engagementRates = videos.map(video => ({
        title: video.title,
        engagementRate: ((video.likes / video.views) * 100).toFixed(2) + '%'
    }));

    const shortVideos = videos.filter(video => video.description.length < 200).length; // Approximation
    const longVideos = videos.length - shortVideos;

    return {
        totalViews,
        averageViews,
        shortVideos,
        longVideos,
        engagementRates
    };
};


const getYoutubeAPIData = async (req,res) => {

    const { keywords } = req.query;

    try {
        const videoIds = await getTrendingVideos(keywords);
        const videoDetails = await getVideoDetails(videoIds);
        const insights = computeInsights(videoDetails);

        const finalOutput = {
            keywords,
            topVideos: videoDetails.map(video => ({
                title: video.title,
                views: video.views.toLocaleString(),
                likes: video.likes.toLocaleString(),
                channel: video.channelTitle,
                publishedAt: new Date(video.publishedAt).toLocaleDateString(),
                hashtags: video.hashtags
            })),
            ...insights
        };

        console.log('Sent final output.')
        res.status(200).json({ finalOutput });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = { getYoutubeAPIData }