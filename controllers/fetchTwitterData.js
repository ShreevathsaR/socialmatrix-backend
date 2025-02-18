const puppeteer = require('puppeteer')




async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0
            const distance = 100
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight
                window.scrollBy(0, distance)
                totalHeight += distance

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer)
                    resolve()
                }
            }, 200)
        })
    })
}

async function getTweets(keyword, filters) {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    let searchUrl = `https://nitter.net/search?f=tweets&q=%23${encodeURIComponent(keyword)}&since=${filters.since}&until=${filters.until}`

    await page.goto(searchUrl, { waitUntil: 'networkidle2' })
    await autoScroll(page)
    await page.waitForSelector('.timeline-item', { timeout: 10000 })

    const tweets = await page.evaluate(() => {
        //function to parse like count
        function parseCount(countText) {
            if (!countText) return 0
        
            countText = countText.trim().toUpperCase()
        
            if (countText.includes('k')) {
                return parseFloat(countText.replace('k', '')) * 1000
            }
            if (countText.includes('m')) {
                return parseFloat(countText.replace('m', '')) * 1000000
            }
            return parseInt(countText.replace(/[^0-9]/g, ''), 10) || 0
        }

        return Array.from(document.querySelectorAll('.timeline-item')).map(tweet => {
            const content = tweet.querySelector('.tweet-content')?.innerText.trim() || "No text"
            const username = tweet.querySelector('.username')?.innerText.trim() || "Unknown"
            const date = tweet.querySelector('.tweet-date')?.innerText.trim() || "Unknown"
            const linkElement = tweet.querySelector('.tweet-link')
            const link = linkElement ? `https://nitter.net${linkElement.getAttribute('href')}` : null
            const likesText = tweet.querySelector('.tweet-stats span:nth-child(3)')?.innerText.trim() || "0"
            const retweetsText = tweet.querySelector('.tweet-stats span:nth-child(2)')?.innerText.trim() || "0"
            const commentsText = tweet.querySelector('.tweet-stats span:nth-child(1)')?.innerText.trim() || "0"
            //pase counts
            const likes = parseCount(likesText)
            const retweets = parseCount(retweetsText)
            const comments = parseCount(commentsText)

            return { content, username, date, link, likes, retweets, comments }
        }).filter(tweet => tweet.likes > 100) //filter likes
    })
    
    await browser.close()
    return tweets
}




module.exports = { getTweets }