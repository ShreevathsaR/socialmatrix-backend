const axios = require('axios');

const getContentSuggestions = async (req, res) => {

    // console.log(req.body)

    // const { prompt } = req.body;

    const keyword = "Fitness and AI";

    const youtubeTopics = `
    1. "How AI is Transforming Home Workouts in 2025"
    2. "Best AI-Powered Fitness Apps for Weight Loss"
    3. "Can AI Create the Perfect Workout Plan?"
    4. "The Role of AI in Personalized Nutrition"
    5. "AI vs Human Trainers: Who Gives Better Advice?"
    `;

    const redditTopics = `
    1. "Has anyone tried an AI personal trainer? Does it work?"
    2. "Best AI-based apps for tracking fitness goals"
    3. "Can AI-generated meal plans help with weight loss?"
    4. "Wearable tech + AI: The future of health tracking?"
    5. "AI-powered fitness coaching vs real trainers – which is better?"
    `;

    const prompt = `You are an expert social media content strategist. Based on the following information, provide detailed content suggestions.

                        Keyword: ${keyword}

                        YouTube Trending Topics:
                        ${youtubeTopics}

                        Reddit Discussions:
                        ${redditTopics}

                        Please analyze this data and provide a structured response with:

                        Content Themes:
                        - List 3-4 main themes that emerge from the data
                        - Explain why each theme would resonate with the audience

                        Specific Post Ideas:
                        - Provide 5 detailed post ideas
                        - Include caption suggestions
                        - Suggest visual elements for each post

                        Hashtag Strategy:
                        - List 10-15 relevant hashtags
                        - Mix of popular and niche hashtags
                        - Include trending hashtags related to the themes

                        Optimal Posting Strategy:
                        - Best times to post
                        - Platform-specific recommendations
                        - Content format suggestions for each platform

                        Content Format Recommendations:
                        - Suggest 3-4 content formats (e.g., Reels, Stories, Posts)
                        - Explain why each format works for the content
                        - Include technical tips for each format

                        End your response with 3 unique angles that could make the content stand out from competitors.`;


    try {
        const response = await axios.post(
            process.env.HUGGING_FACE_API_URL,
            {
                inputs: prompt,
                parameters: {
                    max_length: 1000,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        //   console.log("Response:", response.data);
        res.send(response.data);
    } catch (error) {
        res.send(error.message);
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

module.exports = { getContentSuggestions };