import dotenv from "dotenv";
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from "express-rate-limit";
import { connectDb } from "./config/database";

dotenv.config();
console.info('Starting server in', process.env.NODE_ENV, 'mode');

const app = express();
const PORT = Number.parseInt(process.env.PORT) || 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

app.use(mongoSanitize({ replaceWith: '_' }));


async function startServer() {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();