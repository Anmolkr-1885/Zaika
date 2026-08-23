import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);

  
  channel = await connection.createChannel();

  await channel.assertQueue(process.env.PAYMENT_QUEUE!, {
    durable: true,
  });

  console.log("🐇 connected To Rabbitmq");
};

export const getChannel = () => channel;
