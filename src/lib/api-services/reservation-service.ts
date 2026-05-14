import apiClient from '../api-client';

export const reservationService = {
  // Get all reservations
  getAll: (params?: any) =>
    apiClient.get('/api/reservations', { params }),

  // Get reservation by id
  getById: (id: string) =>
    apiClient.get(`/api/reservations/${id}`),

  // Create reservation
  create: (data: any) =>
    apiClient.post('/api/reservations', data),

  // Update reservation
  update: (id: string, data: any) =>
    apiClient.put(`/api/reservations/${id}`, data),

  // Delete reservation
  delete: (id: string) =>
    apiClient.delete(`/api/reservations/${id}`),
};
