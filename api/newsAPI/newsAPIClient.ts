import dotenv from "dotenv";
import { CronJob } from "cron";
import {
    Client,
    TextChannel,
    REST,
    Routes,
    SlashCommandBuilder,
} from "discord.js";
import KafkaProducer from "../../kafka/kafkaProducer";

dotenv.config();

export type hackerNews = {
    title: string;
    url: string;
};

interface NewsChannel {
    channelId: string;
    guildName: string;
    channelName: string;
}
const rest = new REST({ version: "9" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
);

export default class NewsBot {
    private client: Client;
    private job: CronJob;
    private kafkaProducer: KafkaProducer;
    private channel_id_test_channel = "1326033663472963584";
    private channel_id_tech_news = "1326981935716765878";

    constructor(token: string) {
        this.client = new Client({
            intents: ["Guilds", "GuildMessages", "DirectMessages"],
        });
        this.kafkaProducer = new KafkaProducer();
        this.initializeBot(token);

        this.job = new CronJob(
            "0 0 9 * * *",
            () => this.sendNewsToAllChannels(),
            null,
            true,
            "America/Los_Angeles"
        );
    }

    private async initializeBot(token: string): Promise<void> {
        this.client.once("ready", () => {
            console.log(`Logged in as ${this.client.user?.tag}`);
            this.job.start();
        });

        await this.client.login(token);
    }

    private async sendNewsToAllChannels(): Promise<void> {
        try {
            let news = await this.fetchNews();

            await this.kafkaProducer.sendNewsUpdate({
                news,
                channelId: this.channel_id_test_channel,
            });
            console.log("Sent message to test channel");

            await this.kafkaProducer.sendNewsUpdate({
                news,
                channelId: this.channel_id_tech_news,
            });
            console.log("Sent message to Tech News Channel");
            news = "";
        } catch (err) {
            console.log(`Error sending news to channels: ${err}`);
        }
    }

    private async fetchNews(): Promise<string> {
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
                    let list = this.processData(data);
                    return list ? list : "No news for today";
                } catch (error) {
                    throw new Error("Error parsing news API response");
                }
            } else {
                throw new Error("Errow fetching news API");
            }
        } catch (error) {
            throw new Error("Error fetching news API");
        }
    }

    processData(data): string {
        var newsListString = "List of Hacker News Articles for today:\n";
        const articles = data.articles;
        let list: hackerNews[] = [];
        articles.forEach((article) => {
            list.push({
                title: article.title,
                url: article.url,
            });
        });

        newsListString =
            newsListString +
            list.map((news) => `**${news.title}**\n${news.url}\n\n`).join("");
        console.log(newsListString);
        return newsListString;
    }

    public async processNewsUpdate(newsUpdate: any) {
        const { news, channelId } = JSON.parse(newsUpdate);
        const channel = await this.client.channels.fetch(channelId);
        if (channel instanceof TextChannel) {
            await channel.send(news);
        }
    }

    public async setupCommands(): Promise<void> {
        this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isCommand()) return;

            switch (interaction.commandName) {
                case "ping":
                    await interaction.reply("pong");
                    break;
                case "hello":
                    await interaction.reply(
                        `Hello ${interaction.user.username}`
                    );
                    break;
                case "news":
                    try {
                        let newsString = await this.fetchNews();
                        await interaction.reply(newsString);
                    } catch (err) {
                        await interaction.reply("Error fetching news");
                    }
            }
        });
    }

    public async deployCommands(commands: SlashCommandBuilder[]) {
        try {
            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
                { body: commands }
            );
            console.log("Successfully registered application commands");
        } catch (error) {
            console.log(error);
        }
    }
}
