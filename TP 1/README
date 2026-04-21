# API REST, Endpoints CRUD sur des véhicules et Authetification
## ECV - M1 Dev - Master Lead Developement Frontend 2025 - 2026
### DevOps TP 1 - Intervenant : Yaya DOUMBIA
### Romain THÉRY
---
## Étape 1 : Installation de Node

### Configuration du projet

- Création dossier "*TP 1*"

- run *npm init -y* 

- ajout des packages "*express*" puis "*nodemon*" comme dépendance de dev

### Configuration du fichier package.json

- modification de "*package.json*" :

```
"main": "src/index.js",
"type": "module",
"scripts": {
    "start": "node src/index.js",
	"dev": "nodemon src/index.js"
},
```

### Test initial du serveur

- premier test de de *index.js* :

```
import express from 'express';

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
```

## Étape 2 : Création des données et endpoints

### Préparation des données

- Création d'un fichier "*vehicles.json*" depuis "*fakery.dev*" avec 100 exemples de véhicules au format :

```
{
    "manufacturer": "Hyundai",
    "model": "2",
    "type": "Cargo Van",
    "fuel": "Diesel",
    "color": "orange",
    "vrm": "ZD20KEK"
}
```

### Import et modélisation des données

- import du json dans "*index.js*" avec le type correspondant,
  création d'une séquence simulant le comportement itératif d'id en base de données,
  création d'une classe "*Vehicule*",
  mapping vers une liste manipulable de *Vehicule* :

```
import raw_vehicles from './data/vehicles.json' with { type: 'json' };

const sequence = {
    current: 1,
    next() {
        return this.current++;
    }
};

class Vehicle {
    id;
    manufacturer;
    model;
    type;
    fuel;
    color;
    vrm;
}

const vehicles = raw_vehicles.map(v => {
    const vehicle = new Vehicle();
    Object.assign(vehicle, v);
    vehicle.id = sequence.next();
    return vehicle;
});
```

### Création des endpoints REST

- écriture des endpoints :
	- GET /api/vehicules
	- GET /api/vehicules/:id
	- POST /api/vehicules
	- PUT /api/vehicules/:id
	- DELETE /api/vehicules/:id

### Tests des endpoints

- Tests des endpoints avec Postman : création d'une collection dans l'espace de travail, configuration des urls (chemins et/ou ids), méthodes http, body json si nécessaire

## Étape 3 : Intégration MongoDB

### Configuration de la base de données

- Grâce à mongoDB Compass : Création d'une base "*devops-tp1*" avec une collection "*vehicules*"

- Demande à Claude d'ajouter un champ "*id*" incrémenter à tous les véhicules du json

- Import des données du json dans la collection "*vehicules*" grâce à MongoDB Compass

### Installation du driver MongoDB

- run *npm i mongodb*

### Initialisation de la connexion

- Initialisation de la connexion à la base MongoDB :

```
const dbUrl = 'mongodb://root:example@localhost:27017';
const dbName = 'devops-tp1';

const client = new MongoClient(dbUrl);
client.connect().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

const db = client.db(dbName);
const vehiculesCollection = db.collection('vehicules');
```

### Adaptation des endpoints à MongoDB

- Adaptation à Mongo des endpoints ; exemple avec *GET /api/vehicules* :

```
app.get('/api/vehicules', async (req, res) => {
    console.info("GET /api/vehicules");
    try {
        const vehicules = await vehiculesCollection.find().toArray();
        return res.status(200).json(vehicules);
    }
    catch (err) {
        console.error('Failed to fetch vehicules', err);
        return res.status(500).json({ error: 'Failed to fetch vehicules' });
    };
});
```

## Étape 4 : Authentification et autorisation

### Setup des dépendances

- Création d'une collection Users

- Ajout des packages "*dotenv*", "*bcrypt*" et "*jsonwebtoken*"

### Configuration des variables d'environnement

- configuration du fichier "*.env*" :

```
### Exemple:

NODE_ENV = development | staging | production
PORT = 3000

MONGODB_URI = mongodb://root:example@localhost:27017/db?authSource=admin
### <Protocol>://<Username>:<Password>@<Host>:<Port>/<Database>?authSource=admin

JWT_SECRET = your__jwt__secret
JWT_EXPIRES_IN = 1d
```

### Endpoint d'enregistrement

- Création de l'endpoint "*POST /register*" :

```
app.post('/register', async (req, res) => {
    console.info("POST /register");
  
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
  
    try {
        const existing = await usersCollection.findOne({ username });
        if (existing) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await usersCollection.insertOne({ username, password: hashedPassword });
        return res.status(201).json({ message: 'User registered', userId: result.insertedId });
    }
    catch (err) {
        console.error('Failed to register user', err);
        return res.status(500).json({ error: 'Failed to register user' });
    }
});
```

### Endpoint de connexion

- Création de l'endpoint "*PATCH /login*" :

```
app.patch('/login', async (req, res) => {
    console.info("POST /login");
    
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
  
    try {
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
  
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
  
        const token = jwt.sign({ username: user.username, id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  
        return res.status(200).json({ token });
    }
    catch (err) {
        console.error('Login failed', err);
        return res.status(500).json({ error: 'Login failed' });
    }
}
```

### Middleware d'authentification

- Création de la fonction authenticate :

```
import { ObjectId } from 'mongodb';

const authenticate = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        req.user = user;
        next();
    }
    catch (err) {
        console.error('Authentication failed', err);
        return res.status(500).json({ error: 'Authentication failed' });
    }
}
```

### Application du middleware

- Appliquer le middleware "*authenticate*" aux routes d'écriture (POST, PUT, DELETE) avec : 

```
app.use(authenticate);
```

## Étape 5 : Amélioration de la structure des données et filtrage

### Restructuration du modèle Manufacturer

- Modification de la propriété "manufacturer" des véhicules pour inclure un id qui servira à filtrer :

```
{
    "manufacturer": {
	    "id": 1,
	    "name": "Hyundai"
    },
    "model": "2",
    "type": "Cargo Van",
    "fuel": "Diesel",
    "color": "orange",
    "vrm": "ZD20KEK"
}
```

### Ajout des filtres

- Ajouts à "*GET /vehicules*" pour pouvoir filtrer en fonction de l'id de la marque ou du nom de modèle, le filtre du nom de modèle permet la recherche partielle, si aucun filtre n'est défini en paramètre de la requête, alors on n'en applique aucun:

```
    const manufacturerId = Number.parseInt(req.query.manufacturer);
    const modelName = req.query.model;
  
    const filters = {};
    if (manufacturerId) {
        filters["manufacturer.id"] = manufacturerId;
    }
    if (modelName) {
        filters["model"] = { $regex: modelName, $options: "i" };
    }
	
    try {
        const vehicules = await vehiculesCollection.find(filters).toArray();
        return res.status(200).json({ count: vehicules.length, data: vehicules });
    }
```

# Captures d'écran des tests (Postman)

## GET - Récupération des véhicules

### Récupérer tous les véhicules (=> 200 + Tous les véhicules)
![Get All Vehicles](./screenshots/getall.png)

### Filtrer par marque (=> 200 + Les véhicules filtrés)
![Get All with Manufacturer Filter](./screenshots/getall_manuf.png)

### Filtrer par modèle (=> 200 + Les véhicules filtrés)
![Get All with Model Filter](./screenshots/getall_model.png)

### Filtrer par manufacturier et modèle (=> 200 + Les véhicules filtrés, aucun résultat en l'occurence)
![Get All with Manufacturer and Model Filters](./screenshots/getall_manuf_model.png)

### Récupérer un véhicule par ID (=> 200 + Le véhicule)
![Get Vehicle by ID](./screenshots/getById51.png)

### Véhicule introuvable (=> 404)
![Get Vehicle Not Found](./screenshots/getById106_notfound.png)

## POST - Création de véhicule

### Créer un nouveau véhicule (=> 201 + le nouveau véhicule)
![Post New Vehicle](./screenshots/post.png)

### Conflit sur l'immatriculation (sensée être unique) (=> 409)
![Post VRM Conflict](./screenshots/post_vrmconflict.png)

### Sans le token d'authentification (401)
![Post Unauthorized](./screenshots/post_unauth.png)

## PUT - Mise à jour de véhicule

### Mettre à jour un véhicule (=> 200 + Le véhicule mis à jour)
![Put Update Vehicle](./screenshots/put100.png)

### Véhicule introuvable (=> 404)
![Put Vehicle Not Found](./screenshots/put103_notfound.png)

### Sans le token d'authentification (=> 401)
![Put Unauthorized](./screenshots/put_unauth.png)

## DELETE - Suppression de véhicule

### Supprimer un véhicule (=> 204)
![Delete Vehicle](./screenshots/delete100.png)

### Véhicule introuvable (=> 404)
![Delete Vehicle Not Found](./screenshots/delete105_notfound.png)

### Sans le token d'authentification (=> 401)
![Delete Unauthorized](./screenshots/delete_unauth.png)  

# Bilan final

## Synthèse des étapes réalisées

Ce projet a permis de développer une **API REST complète** pour la gestion de véhicules avec les fonctionnalités suivantes :

1. **Mise en place d'un serveur Node.js/Express** avec une structure de base fonctionnelle
2. **Création d'une base de données** MongoDB et intégration avec l'application
3. **Développement des endpoints CRUD** (GET, POST, PUT, DELETE) pour manipuler les ressources
4. **Implémentation d'un système d'authentification** robuste avec JWT et hashage de mots de passe
5. **Restructuration des données** pour améliorer la modélisation (manufacturer comme objet avec ID)
6. **Ajout de filtres avancés** permettant la recherche par manufacturier et recherche partielle de modèle
7. **Tests exhaustifs** avec Postman couvrant tous les cas de succès et d'erreur

## Éléments compris et appris

### Architecture et concepts backend
- **Architecture REST** : comprendre la semantique des verbes HTTP et les codes de statut
- **Middlewares** : fonctionnement et utilisation dans Express pour l'authentification centralisée
- **Async/await** : gestion des promesses et des opérations asynchrones en JavaScript

### Bases de données
- **MongoDB** : intégration, requêtes CRUD, filtrage avec opérateurs (`$regex`, `$options`)
- **Modélisation** : structuration appropriée des documents pour supporter les filtres et les relations

### Sécurité
- **Authentification JWT** : génération de tokens, validation et décodage
- **Bcrypt** : hashage et vérification des mots de passe de manière sécurisée
- **Protection des routes** : application de middleware d'authentification pour les opérations sensibles

### Validation et gestion d'erreurs
- **Validation des données** : vérification des champs requis avant insertion/mise à jour
- **Codes d'erreur HTTP** : utilisation appropriée (400, 401, 404, 409, 500)
- **Gestion des conflits** : vérification des unicités (VRM) et prévention des doublons

### Outils et environnement
- **Git** : initialisation et versioning
- **Variables d'environnement** : gestion sécurisée des configurations sensibles avec `.env`
- **Postman** : test et documentation des APIs REST

