import dotenv from 'dotenv';
import express from 'express';
import { connectDb } from './config/database.js';
import Produit from './Produit.js';

// Load environment variables
dotenv.config();
console.info('Démarrage du service Produit en mode', process.env.NODE_ENV);

// Server setup
const PORT = process.env.PORT || 3000;
const app = express();


app.use(express.json());


app.get('/', (_, res) => {
    res.json({
        version: '1.0.0',
        statut: 'Service Produit opérationnel',
        message: 'Hello, World!',
    });
});


app.post('/produits', async (req, res) => {
    console.info('POST /produits :', req.body);

    try {
        const { nom, description, prix } = req.body;
        if (!nom || !prix) {
            return res.status(400).json({ error: 'Le nom et le prix sont requis' });
        }
        const produit = new Produit({ nom, description, prix });
        const savedProduit = await produit.save();
        res.status(201).json(savedProduit);
    } catch (error) {
        console.error('Erreur lors de la création du produit:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/produits/acheter', async (req, res) => {
    console.info('POST /produits/acheter :', req.body);

    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'La liste des produits à acheter est vide ou invalide' });
        }
        const produits = await Produit.find({ _id: { $in: ids } });
        return res.status(201).json(produits);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
});

app.get('/produits', async (req, res) => {
    console.info('GET /produits');

    try {
        const produits = await Produit.find();
        res.status(200).json(produits);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


async function startServer() {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(`Service Produit démarré sur le port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start service: ", error.message);
        process.exit(1);
    }
}

await startServer();