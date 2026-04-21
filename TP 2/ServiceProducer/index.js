import amqp from 'amqplib';

let connection, channel;

async function connect() {
    //Connexion au serveur
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);

    //Création d'un nouveau canal
    channel = await connection.createChannel();
    const queue = 'queue1';
    const msg = 'Hello, world!';

    //Déclaration d'une file d'attente
    await channel.assertQueue(queue);

    //Envoie d'un message à la file d'attente
    await channel.sendToQueue(queue, Buffer.from(msg));
    console.log("Message envoyé:", msg);
}
await connect();

setTimeout(function () {
    connection.close();
    process.exit(0)
}, 1000);