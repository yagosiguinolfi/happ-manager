import apiClient from '../api-client';

export const transactionService = {
  // Get all transactions
  getAll: (params?: any) =>
    apiClient.get('/api/transactions', { params }),

  // Get transaction by id
  getById: (id: string) =>
    apiClient.get(`/api/transactions/${id}`),

  // Create transaction
  create: (data: any) =>
    apiClient.post('/api/transactions', data),

  // Update transaction
  update: (id: string, data: any) =>
    apiClient.put(`/api/transactions/${id}`, data),

  // Delete transaction
  delete: (id: string) =>
    apiClient.delete(`/api/transactions/${id}`),

  // Get transactions by date range
  getByDateRange: (startDate: string, endDate: string) =>
    apiClient.get('/api/transactions', {
      params: { startDate, endDate },
    }),
};
