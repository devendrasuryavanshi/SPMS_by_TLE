import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { keepAlive } from './utils/keepAlive';
import authRoutes from './routes/auth.routes';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

if (process.env.NODE_ENV === 'production') {
  const url = process.env.SERVER_URL || '';
  keepAlive(url);
}

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// API routes
app.use('/api/auth', authRoutes);

mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});