import apiClient from '../api-client';

export const categoryService = {
  // Get all categories
  getAll: () =>
    apiClient.get('/api/categories'),

  // Get category by id
  getById: (id: string) =>
    apiClient.get(`/api/categories/${id}`),

  // Create category
  create: (data: any) =>
    apiClient.post('/api/categories', data),

  // Update category
  update: (id: string, data: any) =>
    apiClient.put(`/api/categories/${id}`, data),

  // Delete category
  delete: (id: string) =>
    apiClient.delete(`/api/categories/${id}`),
};
