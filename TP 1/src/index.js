import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();
console.info('Starting server in', process.env.NODE_ENV, 'mode');

// Server setup
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (_, res) => {
    return res.send('Hello World!');
});

// MongoDB connection
const dbUrl = process.env.MONGODB_URI;

const client = new MongoClient(dbUrl);
try {
    await client.connect();
    console.log('Connected to MongoDB');
} catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
}

const db = client.db();
const vehiculesCollection = db.collection('vehicules');
const usersCollection = db.collection('users');

// const sequence = {
//     current: 1,
//     next() {
//         return this.current++;
//     }
// };

class Manufacturer {
    name;
    id;
}

class Vehicule {
    id;
    manufacturer;
    model;
    type;
    fuel;
    color;
    vrm;
}

const authenticate = async (req, res, next) => {
    console.info(`Authenticating user for ${req.method} ${req.path}`);

    const token = req.headers.cookie?.replace('token=', '');
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

// Middleware setup
app.use(express.json());

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

// Route de login
app.patch('/login', async (req, res) => {
    console.info("PATCH /login");

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

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        return res.status(200).json({ token });
    }
    catch (err) {
        console.error('Login failed', err);
        return res.status(500).json({ error: 'Login failed' });
    }
});

// API routes
app.get('/api/vehicules', async (req, res) => {
    console.info("GET /api/vehicules");

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
    catch (err) {
        console.error('Failed to fetch vehicules', err);
        return res.status(500).json({ error: 'Failed to fetch vehicules' });
    };
});

app.get('/api/vehicules/:id', async (req, res) => {
    console.info(`GET /api/vehicules/${req.params.id}`);

    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid vehicule ID' });
    }

    try {
        const vehicule = await vehiculesCollection.findOne({ id });
        if (!vehicule) {
            return res.status(404).json({ error: 'Vehicule not found' });
        }
        return res.status(200).json(vehicule);
    } catch (err) {
        console.error('Failed to fetch vehicule', err);
        return res.status(500).json({ error: 'Failed to fetch vehicule' });
    }
});

app.use(authenticate); // Apply authentication middleware to all routes below

app.post('/api/vehicules', async (req, res) => {
    console.info("POST /api/vehicules");

    try {
        const existing = await vehiculesCollection.findOne({ vrm: req.body.vrm });
        if (existing) {
            return res.status(409).json({ error: 'Cannot create vehicule, VRM already exists' });
        }

        const vehicule = new Vehicule();
        Object.assign(vehicule, req.body);

        const count = await vehiculesCollection.countDocuments();
        vehicule.id = count + 1;

        await vehiculesCollection.insertOne(vehicule);

        return res.status(201).json({ data: vehicule, message: 'Vehicule created' });
    } catch (err) {
        console.error('Failed to create vehicule', err);
        return res.status(500).json({ error: 'Failed to create vehicule' });
    }
});

app.put('/api/vehicules/:id', async (req, res) => {
    console.info(`PUT /api/vehicules/${req.params.id}`);

    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid vehicule ID' });
    }

    try {
        const vehicule = await vehiculesCollection.findOne({ id });
        if (!vehicule) {
            return res.status(404).json({ error: 'Vehicule not found' });
        }

        if (req.body.vrm !== vehicule.vrm && await vehiculesCollection.findOne({ vrm: req.body.vrm })) {
            return res.status(409).json({ error: 'Cannot update vehicule, VRM already exists' });
        }

        const updatedVehicule = { ...vehicule, ...req.body };
        await vehiculesCollection.updateOne({ id }, { $set: updatedVehicule });

        return res.status(200).json({ data: updatedVehicule, message: 'Vehicule updated' });
    } catch (err) {
        console.error('Failed to update vehicule', err);
        return res.status(500).json({ error: 'Failed to update vehicule' });
    }
});

app.delete('/api/vehicules/:id', async (req, res) => {
    console.info(`DELETE /api/vehicules/${req.params.id}`);

    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid vehicule ID' });
    }

    try {
        const result = await vehiculesCollection.deleteOne({ id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Vehicule not found' });
        }
        return res.status(204).send();
    } catch (err) {
        console.error('Failed to delete vehicule', err);
        return res.status(500).json({ error: 'Failed to delete vehicule' });
    }
});