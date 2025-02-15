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

    const prompt = `You are an expert social media content strategist. Based on the following data, generate a structured response in the exact format provided below.  

Keyword: ${keyword}  

YouTube Trending Topics:  
${youtubeTopics}  

Reddit Discussions:  
${redditTopics}  

Provide your response in the following structured format, ensuring consistent headings, subpoints, and bulleting:  

**Content Themes:**  
1. [Theme Title]: [Brief explanation of why this theme resonates with the audience]  
2. [Theme Title]: [Brief explanation of why this theme resonates with the audience]  
3. [Theme Title]: [Brief explanation of why this theme resonates with the audience]  
4. [Theme Title]: [Brief explanation of why this theme resonates with the audience]  

**Specific Post Ideas:**  
1. **Post Idea: "[Title]"**  
   - **Caption:** "[Engaging caption]"  
   - **Visual Element:** "[Suggested visual element]"  
   - **Hashtags:** #Hashtag1 #Hashtag2 #Hashtag3 ...  
2. **Post Idea: "[Title]"**  
   - **Caption:** "[Engaging caption]"  
   - **Visual Element:** "[Suggested visual element]"  
   - **Hashtags:** #Hashtag1 #Hashtag2 #Hashtag3 ...  
3. **Post Idea: "[Title]"**  
   - **Caption:** "[Engaging caption]"  
   - **Visual Element:** "[Suggested visual element]"  
   - **Hashtags:** #Hashtag1 #Hashtag2 #Hashtag3 ...  
4. **Post Idea: "[Title]"**  
   - **Caption:** "[Engaging caption]"  
   - **Visual Element:** "[Suggested visual element]"  
   - **Hashtags:** #Hashtag1 #Hashtag2 #Hashtag3 ...  
5. **Post Idea: "[Title]"**  
   - **Caption:** "[Engaging caption]"  
   - **Visual Element:** "[Suggested visual element]"  
   - **Hashtags:** #Hashtag1 #Hashtag2 #Hashtag3 ...  

**Hashtag Strategy:**  
1. #Hashtag1  
2. #Hashtag2  
3. #Hashtag3  
... (Total 10-15 relevant hashtags)  

**Optimal Posting Strategy:**  
**Best times to post:** [Time ranges]  
**Platform-specific recommendations:** [YouTube – format, Instagram – format, Twitter – format, etc.]  
**Content format suggestions for each platform:** [Format recommendations per platform]  

**Content Format Recommendations:**  
1. **[Format Name]:** [Why this format works and its technical tips]  
2. **[Format Name]:** [Why this format works and its technical tips]  
3. **[Format Name]:** [Why this format works and its technical tips]  
4. **[Format Name]:** [Why this format works and its technical tips]  

**Unique Angles:**  
1. [Unique angle 1]  
2. [Unique angle 2]  
3. [Unique angle 3]  

⚠ **Important Notes:**  
- Maintain this exact structure.  
- Use bold formatting where indicated.  
- Ensure the bulleting, numbering, and headings remain unchanged.  
- Keep responses concise but informative.`;

const parsedData = {
    contentThemes: [],
    postIdeas: [],
    hashtags: [],
    optimalPosting: {},
    contentFormatRecommendation: [],
    uniqueAngles: [],
  };


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
        
        const result = response.data[0].generated_text;


        result.split('\n\n').forEach((section) => {
            if (section.trim().startsWith("**Content Themes:**")) {
              parsedData["contentThemes"] = section
                .trim()
                .split("\n")
                .slice(1)
                .map((line) => line.trim().replace(/^\d+\.\s*/,""));
            }
            if (section.trim().startsWith("**Specific Post Ideas:**")) {
              const arrayOfLines = section
                .trim()
                .split("\n")
                .slice(1)
                .map((line) => line.replace("-", "").trim());
          
              let currentPost = {};
          
              arrayOfLines.forEach((line) => {
                if (/^\d+\./.test(line)) {
                  if (Object.keys(currentPost).length > 0) {
                    parsedData.postIdeas.push(currentPost);
                  }
                  currentPost = { title: line.replace(/^\d+\.\s*/, "").trim() };
                } else if (line.includes("Caption:")) {
                  currentPost.caption = line.replace("**Caption:**", "").trim(); 
                } else if (line.includes("Visual Element:")) {
                  currentPost.visualElement = line.replace("**Visual Element:**", "").trim();
                }
          
              });
                if (Object.keys(currentPost).length > 0) {
                  // Push the last post object
                  parsedData.postIdeas.push(currentPost);
                }
          
              // console.log(arrayOfLines)
            }
            if (section.trim().startsWith("**Hashtag Strategy:**")) {
              parsedData["hashtags"] = section
                .split("\n")
                .slice(1)
                .map((line) => line.replace("-", "").trim().split(" ")[1]);
            }
            if (section.trim().startsWith("**Optimal Posting Strategy:**")) {
              const arrayOfLines = section.split("\n").slice(1);
          
              console.log(arrayOfLines)
          
              const finalObject = {
                bestTimesToPost: "",
                platformSpecific: "",
                contentFormatSuggestion: "",
              };
          
              let currentKey = "";
          
              arrayOfLines.forEach((line) => {
                line = line.replace("-", "").trim(); // Remove hyphens and trim spaces
          
                if (line.startsWith("**Best times to post:**")) {
                  currentKey = "bestTimesToPost";
                  finalObject[currentKey] = line.replace("**Best times to post:**", "").trim();
                } else if (line.startsWith("**Platform-specific recommendations:**")) {
                  currentKey = "platformSpecific";
                  finalObject[currentKey] = line.replace("**Platformspecific recommendations:**", "").trim();
                } else if (line.startsWith("**Content format suggestions for each platform:**")) {
                  currentKey = "contentFormatSuggestion";
                  finalObject[currentKey] = line.replace("**Content format suggestions for each platform:**", "").trim();
                } else if (currentKey) {
                  // Append extra lines if they belong to the last detected key
                  finalObject[currentKey] += " " + line;
                }
              });
          
              parsedData["optimalPosting"] = finalObject;
            }
            if (section.trim().startsWith("**Content Format Recommendations:**")) {
              parsedData["contentFormatRecommendation"] = section
                .split("\n")
                .slice(1)
                .map((line) => line.trim().replace(/^\d+\.\s*/,''));
            }
            if (section.trim().startsWith("**Unique Angles:**")) {
              parsedData["uniqueAngles"] = section
                .split("\n")
                .slice(1)
                .map((line) => line.trim().replace(/^\d+\.\s*/,''));
            }
          });

          res.send(parsedData);

    } catch (error) {
        res.send(error.message);
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

module.exports = { getContentSuggestions };