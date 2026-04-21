# Initiation aux architectures micro-services et mise en pratique avec Node et MongoDB
## ECV - M1 Dev - Master Lead Developement Frontend 2025 - 2026
### DevOps TP 2 - Intervenant : Yaya DOUMBIA
### Romain THÉRY
---

## Introduction :

Ce projet vise à développer un exemple d'architecture en microservices pour une plateforme de gestion de produits et de commandes. Les objectifs sont :

1. **Architecturer une application en microservices** :  
Implémenter une structure modulaire avec des services indépendants (Produit, Commande, Authentification)
2. **Créer des APIs REST robustes** :  
Développer des endpoints CRUD pour gérer les produits et les commandes
3. **Sécuriser l'accès** :  
Mettre en place une authentification JWT pour protéger les ressources
4. **Gérer les données** :  
Utiliser MongoDB pour le stockage persistant des données
5. **Explorer la communication inter-services asynchrone** :  
Utiliser RabbitMQ pour la messagerie asynchrone entre services

### Mise en place de 3 micro-services : Produit, Commande et Auth

Création des deux bases respectives  
![](screenshots/Capture%20d'écran%202026-04-21%20132502.png)

### Endpoints à écrire:
- "*GET localhost:4000/produit/acheter*" :
	Cherche les produits à acheter et retourne leur objets correspondants
- "*POST localhost:4000/produit/ajouter*" : 
	Ajoute un nouveau produit à la base de données

- "*POST localhost:4001/commande/ajouter*" :
	Ajoute une nouvelle commande à la base de données


## Produit

Premièrement, établir la structure du Produit en un modèle Mongoose simple contenant le nom, la description et le prix. Implémenter l'endpoint d'ajout pour enregistrer de nouveaux produits avec une validation minimale des champs requis. Ensuite, mettre en place un endpoint dédié à l'achat pour récupérer plusieurs produits à partir d'une liste d'identifiants. Les tests Postman permettent de vérifier que la création et la récupération fonctionnent correctement avec la base MongoDB.

### Schéma Mongoose

```
import mongoose from "mongoose";
  
const produitSchema = new mongoose.Schema(
    {
        nom: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        prix: {
            type: Number,
            required: true
        }
    },
    // Créer et gère autmatiquement les dates createdAt et updatedAt
    { timestamps: true }
);

const Produit = mongoose.model("Produit", produitSchema);

export default Produit;
```

### Endpoint POST /produits - Ajouter un produit

```
app.post('/produits', async (req, res) => {
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
```
### Test Postman sur "*POST /produits*"

![](screenshots/Capture%20d'écran%202026-04-21%20142043.png)

### Endpoint GET /produits/acheter - Récupérer les produits à acheter

```
app.get('/produits/acheter', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'La liste des produits à acheter est vide ou invalide' });
        }
        const produits = await Produit.find({ _id: { $in: ids } });
        return res.status(200).json(produits);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
});
```

### Test Postman sur "*POST /produits/acheter*"

![](screenshots/Capture%20d'écran%202026-04-21%20152028.png)

## Commande

Construire le service Commande pour centraliser la création des commandes en s'appuyant sur les données du service Produit. Après avoir défini le schéma Mongoose (email utilisateur, produits, prix total), ajouter une fonction pour appeler le service Produit et récupérer les informations nécessaires à partir des IDs reçus. Ensuite isoler le calcul du prix total dans une autre fonction utilitaire afin de garder une logique claire et réutilisable. Enfin, assembler ces étapes dans l'endpoint de création de commande : validation de la requête, récupération des produits, calcul du montant, puis sauvegarde en base.

### Schéma Mongoose

```
import mongoose from "mongoose";

const commandeSchema = new mongoose.Schema(
    {
        email_utilisateur: {
            type: String,
            required: true
        },
        produits: {
            type: [String],
            required: true
        },
        prix_total: {
            type: Number,
            required: true
        }
    },
    // Créer et gère autmatiquement les dates createdAt et updatedAt
    { timestamps: true }
);

const Commande = mongoose.model("Commande", commandeSchema);

export default Commande;
```

### Fonction utilitaire - Récupérer les produits par IDs

Fonction pour récupérer les produits en fonction de leur id en appelant le service produit depuis le service commande
```
import axios from 'axios';
  
export const getProduitsByIds = async (ids) => {
    const URL = process.env.SERVICE_PRODUIT_URL + '/produits/acheter';
    try {
        const response = await axios.post(URL, { ids }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.info('Produits récupérés :', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error.message);
        throw new Error('Erreur lors de la récupération des produits');
    }
}
```

### Fonction utilitaire - Calculer le prix total

```
export const calculateTotalPrice = (produits) => {
    const prixTotal = produits.reduce((total, produit) => {
        return total + (produit.prix || 0);
    }, 0);
    return prixTotal;
}
```

### Endpoint POST /commandes - Ajouter une commande

```
import Commande from './Commande.js';
import { getProduitsByIds } from './produitApi.js';
import { calculateTotalPrice } from './utils.js';

app.post('/commandes', async (req, res) => {
    console.info('POST /commandes :', req.body);
  
    try {
        const { email_utilisateur, produits } = req.body;
        if (!email_utilisateur || !produits) {
            return res.status(400).json({ error: 'L\'email de l\'utilisateur et la liste des produits sont requis' });
        }
        const prix_total = calculateTotalPrice(await getProduitsByIds(produits));
        const commande = new Commande({ email_utilisateur, produits, prix_total });
        const savedCommande = await commande.save();
        res.status(201).json(savedCommande);
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
```

### Test Postman sur "POST /commandes*"

![](screenshots/Capture%20d'écran%202026-04-21%20152128.png)

## Authentification

Commencer par la création d'une base dédiée et d'un modèle utilisateur avec des contraintes d'unicité sur le nom d'utilisateur et l'email. Ensuite implémenter l'endpoint d'inscription pour refuser les doublons et stocker un mot de passe chiffré avec bcrypt. L'endpoint de connexion vérifie ensuite l'identité de l'utilisateur et génère un token JWT signé avec les variables d'environnement du projet. Pour sécuriser le service Commande, "logger" le middleware afin de contrôler la présence et la validité du token avant d'autoriser l'accès à la route.

### Nouvelle Base de Données

![](screenshots/Capture%20d'écran%202026-04-21%20165307.png)

### Schéma Mongoose - User

```
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        }
    },
    // Créer et gère autmatiquement les dates createdAt et updatedAt
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
```

### Endpoint POST /auth/register - Inscription

```
app.post('/auth/register', async (req, res) => {
    console.info("POST /auth/register");
  
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await User.create({ username, email, password: hashedPassword });
        return res.status(201).json({ message: 'User registered', userId: createdUser._id });
    }
    catch (err) {
        console.error('Failed to register user', err);
        return res.status(500).json({ error: 'Failed to register user' });
    }
});
```

![](screenshots/Capture%20d'écran%202026-04-21%20155208.png)

### Endpoint POST /auth/login - Connexion

```
app.post('/auth/login', async (req, res) => {
    console.info("PATCH /auth/login");
  
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
  
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
  
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
  
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  
        return res.status(200).json({ "token": token });
    }
    catch (err) {
        console.error('Login failed', err);
        return res.status(500).json({ error: 'Login failed' });
    }
});
```

![](screenshots/Capture%20d'écran%202026-04-21%20155312.png)

### Middleware d'authentification - Service Commande

```
import jwt from 'jsonwebtoken';
  
export const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // (id + email)
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Invalid token', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
```

#### Intégration du middleware - index.js

```
app.use(isAuthenticated); // Middleware d'authentification pour toutes les routes suivantes

app.post('/commandes', async (req, res) => {
	...
    const commande = new Commande({
	    email: req.user.email, // Utilisation direct des infos utilisateur injecté grâce au middleware
	    produits,
	    prix_total
	});
	...
});
```

### Tests du middleware

#### Test sans token

![](screenshots/Capture%20d'écran%202026-04-21%20161007.png)

#### Test avec token

![](screenshots/Capture%20d'écran%202026-04-21%20161353.png)


## RabbitMQ :

Pour introduire la communication asynchrone entre services, j'ai configuré RabbitMQ puis vérifié son fonctionnement via l'interface web. J'ai créé un premier service producteur pour ouvrir une connexion, déclarer une file et y publier un message de test. En parallèle, j'ai mis en place un service consommateur pour écouter cette même file, lire le message reçu puis l'acquitter. Cette étape valide le principe d'échange de messages et prépare le terrain pour des flux inter-services plus complets.

### Interface web
![](screenshots/Capture%20d'écran%202026-04-21%20162239.png)


### Service "Producteur" - Envoi de messages

```
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
```

![](screenshots/Capture%20d'écran%202026-04-21%20163135.png)

### Service "Consommateur" - Réception de messages

```
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
```

![](screenshots/Capture%20d'écran%202026-04-21%20164045.png)

## Conclusion :

Ce TP m'a permis de couvrir un cycle complet de mise en place d'une architecture microservices: modélisation des données, exposition d'APIs REST, sécurisation par JWT et introduction de la messagerie asynchrone avec RabbitMQ. Chaque service reste découplé, tout en collaborant avec les autres via des appels HTTP ou des messages, ce qui constitue une base solide pour des projets distribués plus avancés.
