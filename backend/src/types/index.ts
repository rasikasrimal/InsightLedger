import { Request } from 'express';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PREMIUM = 'premium'
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum BudgetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}
