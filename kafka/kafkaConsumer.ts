import { Kafka, Consumer } from "kafkajs";

export default class KafkaConsumer {
    kafka: Kafka;
    consumer: Consumer;
    constructor(groupId: string) {
        this.kafka = new Kafka({
            clientId: "discord-consumer-bot",
            brokers: ["127.0.0.1:9092"],
            retry: {
                initialRetryTime: 100,
                retries: 8,
            },
        });

        this.consumer = this.kafka.consumer({ groupId });
    }

    async connectConsumer() {
        try {
            console.log("Attempting to connect consumer...");
            await this.consumer.connect();
            console.log("Consumer connected successfully");
            await this.consumer.subscribe({
                topic: "news-updates",
                fromBeginning: true,
            });
            console.log(
                "Consumer subscribed successfully to news-update topic"
            );
        } catch (err) {
            console.error("Cannot connect to consumer:", err);
        }
    }

    async testConnection() {
        try {
            const admin = this.kafka.admin();
            await admin.connect();

            console.log("KafkaJs consumer connected successfully to broker!");
            await admin.disconnect();
        } catch (err) {
            console.error("Failed to connect to broker", err);
        }
    }
}
