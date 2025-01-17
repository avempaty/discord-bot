import { Kafka, Producer } from "kafkajs";

export default class KafkaProducer {
    kafka: Kafka;
    producer: Producer;
    constructor() {
        this.kafka = new Kafka({
            clientId: "discord-producer-bot",
            brokers: ["127.0.0.1:9092"],
            retry: {
                initialRetryTime: 100,
                retries: 8,
            },
        });

        this.producer = this.kafka.producer();
    }

    async sendNewsUpdate(newsData: { news: string; channelId: string }) {
        try {
            console.log("Attempting to connect producer...")
            await this.producer.connect();
            console.log("Producer connected successfully")
            await this.producer.send({
                topic: "news-updates",
                messages: [{ value: JSON.stringify(newsData) }],
            });
            await this.producer.disconnect();
        } catch (err) {
            console.error("Producer failed to send message");
        }
    }

    async testConnection() {
        try {
            const admin = this.kafka.admin();
            await admin.connect();

            console.log("KafkaJs producer connected successfully to broker!");
            await admin.disconnect();
        } catch (err) {
            console.error("Failed to connect to broker", err);
        }
    }
}
