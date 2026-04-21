import amqp from 'amqplib';

const handleMessage = () => {
    return (msg) => {
        console.log("Message reçu:", msg.content.toString());
        channel.ack(msg);
    };
};

let connection, channel;

async function connect() {
    //Connexion au serveur
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);

    //Création d'un nouveau canal
    channel = await connection.createChannel();
    const queue = 'queue1';

    //Déclaration d'une file d'attente
    await channel.consume(queue, handleMessage());
}
await connect();