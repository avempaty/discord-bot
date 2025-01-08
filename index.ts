import {
    Client,
    SlashCommandBuilder,
    Routes,
    REST,
    RESTPostAPIApplicationCommandsJSONBody,
    GatewayIntentBits,
} from "discord.js";
import { fetchNewsAPI, hackerNews } from "./api/newsAPI/newsAPIClient";
import dotenv from "dotenv";

dotenv.config();

const rest = new REST({ version: "9" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
);
var newsList: hackerNews[] = [];
var newsListString = "List of Hacker News Articles for today:\n";

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with pong!"),
    new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Say hello to you!"),
    new SlashCommandBuilder()
        .setName("news")
        .setDescription("Get the latest news from The Hacker News"),
];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
    ],
});

client.once("ready", async (e) => {
    console.log(`${e.user.username} is ready!`);
    console.log(`Bot is in ${e.guilds.cache.size} servers`);
    newsList = await fetchNewsAPI();
    console.log(newsList)
    newsListString = newsListString + newsList.map((news) => `**${news.title}**\n${news.url}\n\n`).join("")
    console.log(newsListString)
});

async function deployCommands() {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
            { body: commands }
        );
        console.log("Successfully registered application commands");
    } catch (error) {
        console.error(error);
    }
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    switch (interaction.commandName) {
        case "ping":
            console.log(newsList)
            await interaction.reply("pong");
            break;
        case "hello":
            await interaction.reply(`Hello ${interaction.user.username}`);
            break;
        case "news":
            await interaction.reply(`${newsListString}`);
            break;
    }
});

// client.on("messageCreate", (message) => {
//     console.log(message.content);
//     if (message.author.bot) return;

//     if (message.content === "!ping") {
//         message.reply('its pong time')
//         message.reply("pong");
//     }
// });
client.login(process.env.DISCORD_BOT_TOKEN);
deployCommands();
