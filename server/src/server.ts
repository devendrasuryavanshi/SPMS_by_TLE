import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { keepAlive } from './utils/keepAlive.utils';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import syncRoutes from './routes/sync.routes';
import studentProfileRoutes from './routes/studentProfile.routes';
import dotenv from 'dotenv';
import logger from './utils/logger.utils';
import CronScheduler from './services/cronSchedule.service';

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
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
app.use('/api/students', studentRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/profile', studentProfileRoutes);

mongoose.connect(MONGODB_URI).then(async () => {
  logger.info('Connected to MongoDB');

  // Initialize cron scheduler
  await CronScheduler.initializeScheduler();

  app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
  });
}).catch((error) => {
  logger.error('Failed to connect to MongoDB:', error);
});

process.on('SIGTERM', () => {
  CronScheduler.stopScheduler();
  process.exit(0);
});

process.on('SIGINT', () => {
  CronScheduler.stopScheduler();
  process.exit(0);
});