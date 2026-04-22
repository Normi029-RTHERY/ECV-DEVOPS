import dotenv from 'dotenv';
import express from 'express';
import Commande from './Commande.js';
import { connectDb } from './config/database.js';
import { getProduitsByIds } from './produitApi.js';
import { calculateTotalPrice } from './utils.js';
import { isAuthenticated } from './middleware/auth.js';

// Load environment variables
dotenv.config();
console.info('Démarrage du service Commande en mode', process.env.NODE_ENV);

// Server setup
const PORT = process.env.PORT || 3000;
const app = express();


app.use(express.json());


app.get('/', (_, res) => {
    res.json({
        version: '1.0.0',
        statut: 'Service Commande opérationnel',
        message: 'Hello, World!',
    });
});

app.use(isAuthenticated); // Middleware d'authentification pour toutes les routes suivantes

app.post('/commandes', async (req, res) => {
    console.info('POST /commandes :', req.body);

    try {
        const { produits } = req.body;
        if (!produits) {
            return res.status(400).json({ error: 'La liste des produits est requise' });
        }
        const prix_total = calculateTotalPrice(await getProduitsByIds(produits));
        console.log(req.user);

        const commande = new Commande({ email_utilisateur: req.user.email, produits, prix_total });
        const savedCommande = await commande.save();
        res.status(201).json(savedCommande);
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/commandes', async (req, res) => {
    console.info('GET /commandes');

    try {
        const commandes = await Commande.find();
        res.status(200).json(commandes);
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


async function startServer() {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(`Service Commande démarré sur le port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start service: ", error.message);
        process.exit(1);
    }
}

await startServer();