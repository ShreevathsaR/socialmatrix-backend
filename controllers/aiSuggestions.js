const axios = require('axios');

const getContentSuggestions = async (req, res) => {

    // console.log(req.body)

    // const { prompt } = req.body;

    const keyword = "Deepseek AI";

    const youtubeTopics = `China's Deepseek AI Explained,What is DeepSeek? How To Use It? | ChatGPT Killer,What’s Really Happening with DeepSeek,Chinese AI DeepSeek Censorship Exposed!,DeepSeek: चीन का AI जिसने Silicon Valley को हिला दिया! 😱 #deepseek #chinanews #donaldtrump,How He Makes $1,500/Month Using DeepSeek AI (Copy His Strategy!) 😯 | DeepSeek-R1,How To Use Deepseek AI! (Complete Beginners Guide),How China’s DeepSeek Came for Big AI,Can DeepSeek AI Really Code a Python Crypto Trading Bot in 5 Minutes?,Earn 100K/Month Using DeepSeek AI | Create Tool Website Using DeepSeek AI | DeepSeek R1 Full Course`;
    
    const redditTopics = `Is Deepseek really that good? : r/OpenAI, Deepseek V3 is absolutely astonishing : r/LocalLLaMA, I Broke DeepSeek AI 😂 : r/ChatGPT, DeepSeek AI is free, but it's literally down 99% of the time., DeepSeek AI is taking the world by storm. Since it is open ..., DeepSeek, AI and Legal Review : r/ediscovery, What Is China's DeepSeek and Why Is It Freaking Out ...`;    

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
**Best times to post:** [Time ranges in IST] 
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
        console.log(result);


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
        
        
            const finalObject = {
              bestTimesToPost: "",
              platformSpecific: "",
              contentFormatSuggestion: "",
            };
        
            let currentKey = "";
        
            arrayOfLines.forEach((line) => {
              line = line.replace(/\*\*/g, "").trim(); // Remove hyphens and trim spaces
        
              if (line.includes("Best times to post:")) {
                currentKey = "bestTimesToPost";
                finalObject[currentKey] = line.replace("Best times to post:", "").trim();
              } else if (line.includes("Platform-specific recommendations:")) {
                currentKey = "platformSpecific";
                finalObject[currentKey] = line.replace("Platform-specific recommendations:", "").trim();
              } else if (line.includes("Content format suggestions for each platform:")) {
                currentKey = "contentFormatSuggestion";
                finalObject[currentKey] = line.replace("Content format suggestions for each platform:", "").trim();
              } else if (currentKey) {
                finalObject[currentKey] += " " + line; // Append additional lines
              }
            });
        
            parsedData["optimalPosting"] = finalObject;
          }
          if (section.trim().startsWith("**Content Format Recommendations:**")) {
            parsedData["contentFormatRecommendation"] = section
              .split("\n")
              .slice(1)
              .map((line) => line.trim().replace(/^\d+\.\s*|\[|\]/g, ''));
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