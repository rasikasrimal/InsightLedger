import apiClient from './client';
import { DashboardStats, SpendingByCategory, MonthlyTrend, Insight } from '../types';

export const analyticsAPI = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/analytics/dashboard');
    return response.data;
  },

  getSpendingByCategory: async (startDate?: string, endDate?: string): Promise<SpendingByCategory[]> => {
    const response = await apiClient.get<SpendingByCategory[]>('/analytics/spending-by-category', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getMonthlyTrends: async (months?: number): Promise<MonthlyTrend[]> => {
    const response = await apiClient.get<MonthlyTrend[]>('/analytics/monthly-trends', {
      params: { months }
    });
    return response.data;
  },

  getInsights: async (): Promise<{ insights: Insight[] }> => {
    const response = await apiClient.get<{ insights: Insight[] }>('/analytics/insights');
    return response.data;
  },

  askAI: async (question: string): Promise<{ answer: string }> => {
    const response = await apiClient.post<{ answer: string }>('/analytics/ask', { question });
    return response.data;
  }
};
