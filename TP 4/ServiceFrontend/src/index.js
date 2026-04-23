import dotenv from 'dotenv';
import express from 'express';

// Load environment variables
dotenv.config();
console.info('Démarrage du service Frontend en mode', process.env.NODE_ENV);

// Server setup
const PORT = process.env.PORT || 3000;
const app = express();

app.listen(PORT, () => {
    console.log(`Service Frontend démarré sur le port ${PORT}`);
});

app.use(express.json());

app.get('/', (_, res) => {
    res.status(200).sendFile('index.html', { root: './public' });
});