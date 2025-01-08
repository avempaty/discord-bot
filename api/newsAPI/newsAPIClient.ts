import dotenv from "dotenv";

dotenv.config();

export type hackerNews = {
    title: string,
    url: string,
}

export async function fetchNewsAPI(): Promise<hackerNews[]> {
    var date = new Date();
    var yesterday = date.getDate() - 1;
    var yesterdayDate = new Date(date.setDate(yesterday));
    var dateString = yesterdayDate.toISOString().split("T")[0];
    let response;
    try {
        response = await fetch(
            `https://newsapi.org/v2/everything?apiKey=${process.env.NEWS_API_KEY}&domains=thehackernews.com&from=${dateString}`
        );
        if (response.ok) {
            try {
                let data = await response.json();
                let list =  processData(data);
                return list ? list : [];
            } catch (error) {
                throw new Error("Error parsing news API response");
            }
        } else {
            throw new Error("Errow fetching news API")
        }
    } catch (error) {
        throw new Error("Error fetching news API");
    }
}

function processData(data): hackerNews[] {
    const articles = data.articles;
    let list: hackerNews[] = [];
    articles.forEach((article) => {
        list.push({
            title: article.title,
            url: article.url,
        })
    })
    //console.log(list);
    return list;
}
