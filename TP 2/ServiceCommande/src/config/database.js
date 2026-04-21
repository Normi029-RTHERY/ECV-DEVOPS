import mongoose from 'mongoose';

export async function connectDb() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDb connecté : ${conn.connection.host}`);
        console.log(`Base de données : ${conn.connection.name}`);
    }
    catch (error) {
        console.error("Erreur lors de la connexion à la base de données : ", error.message);
        process.exit(1);
    }
}

export async function disconnectDb() {
    try {
        await mongoose.disconnect();
        console.log("MongoDb déconnecté");
    } catch (error) {
        console.error("Erreur lors de la déconnexion de la base de données : ", error.message);
    }
}

process.on('SIGINT', async () => {
    await disconnectDb();
    process.exit(0);
});