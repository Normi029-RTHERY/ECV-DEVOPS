import { MongoClient } from "mongodb";

const client = new MongoClient(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

export async function connectDb() {
    try {
        const conn = await client.connect();
        console.info("MongoDb connecté");
        return conn.db(process.env.DB_NAME);
    }
    catch (error: any) {
        console.error("Erreur lors de la connexion à la base de données : ", error.message);
        process.exit(1);
    }
}

export async function disconnectDb() {
    try {
        await client.close();
        console.log("MongoDb déconnecté");
    } catch (error: any) {
        console.error("Erreur lors de la déconnexion de la base de données : ", error.message);
    }
}