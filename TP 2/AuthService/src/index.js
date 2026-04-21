import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { connectDb } from './config/database.js';
import User from './User.js';

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
        statut: 'Service Auth opérationnel',
        message: 'Hello, World!',
    });
});



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



async function startServer() {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(`Service Auth démarré sur le port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start service: ", error.message);
        process.exit(1);
    }
}

await startServer();