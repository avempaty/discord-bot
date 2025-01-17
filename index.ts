import { SlashCommandBuilder, REST } from "discord.js";
import NewsBot from "./api/newsAPI/newsAPIClient";
import KafkaConsumer from "./kafka/kafkaConsumer";
import KafkaProducer from "./kafka/kafkaProducer";
import dotenv from "dotenv";

dotenv.config();

const rest = new REST({ version: "9" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
);

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

async function main() {
    const newsBot = new NewsBot(process.env.DISCORD_BOT_TOKEN!);
    const kafkaConsumer = new KafkaConsumer("news-group-id");
    newsBot.deployCommands(commands);
    newsBot.setupCommands;

    try {
        await kafkaConsumer.connectConsumer();
        await kafkaConsumer.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(
                    `Topic: ${topic}, partition: ${partition}, message: ${message}`
                );
                console.log(
                    `Message Key: ${message.key}, Message Value: ${message.value}`
                );
                const newsUpdate = message.value!.toString();
                console.log(newsUpdate);
                await newsBot.processNewsUpdate(newsUpdate);
            },
        });
    } catch (error) {
        console.error("Consumer run error:", error);
    }
}
main();


async function testAdminConnection() {
    const consumer = new KafkaConsumer("news-group");
    const producer = new KafkaProducer();
    try {
        await consumer.testConnection();
        await producer.testConnection();
    } catch (err) {
        console.error(err);
    }
}
//testAdminConnection()
