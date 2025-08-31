import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
dotenv.config();

import connectDB from './database/connect.js';
import userRoutes from './routes/user.js';
import bookRoutes from './routes/book.js';
import authRoutes from './routes/auth.js'
import userDataRoutes from './routes/userData.js'


const app = express();
const PORT = process.env.PORT || 3200;

// Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'https://booklog-client.vercel.app'],
    credentials: true
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

app.get('/test', (req, res) => {
    res.send('Hello from Express!');
});

app.get('/api/test', (req, res) => {
    res.send('Hello from Express!');
});

// app.use('/api/user', userRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/userdata', userDataRoutes);

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