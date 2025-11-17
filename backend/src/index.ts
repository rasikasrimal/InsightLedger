import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import bcrypt from 'bcryptjs';
import User from './models/User';
import { UserRole } from './types';

import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import categoryRoutes from './routes/categoryRoutes';
import budgetRoutes from './routes/budgetRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InsightLedger API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

async function ensureDemoUser() {
  try {
    const demoEmail = process.env.DEMO_EMAIL || 'demo@example.com';
    const demoPassword = process.env.DEMO_PASSWORD || 'password123';
    const demoName = process.env.DEMO_NAME || 'Demo User';

    const existing = await User.findOne({ email: demoEmail });
    if (existing) {
      console.log(`Demo user already exists (${demoEmail})`);
      return;
    }

    const hashedPassword = await bcrypt.hash(demoPassword, 10);
    await User.create({
      email: demoEmail,
      password: hashedPassword,
      name: demoName,
      role: UserRole.USER,
    });
    console.log(`Demo user created (${demoEmail} / ${demoPassword})`);
  } catch (error) {
    console.error('Failed to ensure demo user:', error);
  }
}

const startServer = async () => {
  try {
    await connectDB();
    await ensureDemoUser();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
