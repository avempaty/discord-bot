import {
    Client,
    SlashCommandBuilder,
    Routes,
    REST,
    RESTPostAPIApplicationCommandsJSONBody,
    GatewayIntentBits,
} from "discord.js";
import NewsBot from "./api/newsAPI/newsAPIClient";
import { hackerNews } from "./api/newsAPI/newsAPIClient";
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


const newsBot = new NewsBot(process.env.DISCORD_BOT_TOKEN!)

newsBot.deployCommands(commands);
newsBot.setupCommands()
