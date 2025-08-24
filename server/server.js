import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

import connectDB from './database/connect.js';
import userRoutes from './routes/user.js';
import bookRoutes from './routes/book.js';

// ES6 equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3200;

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(express.json())

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something broke!'
    });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/test', (req, res) => {
    res.send('Hello from Express!');
});

app.use('/api/user', userRoutes);
app.use('/api/book', bookRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Catch-all handler: send back React's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => { console.log(`Listening to port: ${PORT}`) })
    } catch (error) {
        console.log(error)
    }
}
start()