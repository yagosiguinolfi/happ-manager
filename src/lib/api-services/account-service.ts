import apiClient from '../api-client';

export const accountService = {
  // Get all accounts
  getAll: () =>
    apiClient.get('/api/accounts'),

  // Get account by id
  getById: (id: string) =>
    apiClient.get(`/api/accounts/${id}`),

  // Create account
  create: (data: any) =>
    apiClient.post('/api/accounts', data),

  // Update account
  update: (id: string, data: any) =>
    apiClient.put(`/api/accounts/${id}`, data),

  // Delete account
  delete: (id: string) =>
    apiClient.delete(`/api/accounts/${id}`),
};
