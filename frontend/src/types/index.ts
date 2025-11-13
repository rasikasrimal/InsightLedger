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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  userId: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  categoryId: Category | string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  userId: string;
  categoryId: Category | string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  spent?: number;
  remaining?: number;
}

export interface DashboardStats {
  period: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
