import apiClient from './client';
import { Category } from '../types';

export const categoriesAPI = {
  getAll: async (type?: 'income' | 'expense'): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories', {
      params: type ? { type } : undefined
    });
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  }
};
