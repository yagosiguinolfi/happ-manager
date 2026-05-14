import apiClient from '../api-client';

export const userService = {
  // Login
  login: (email: string, password: string) =>
    apiClient.post('/api/users/login', { email, password }),

  // Get current user
  getCurrentUser: () =>
    apiClient.get('/api/users/me'),

  // Create user
  createUser: (userData: any) =>
    apiClient.post('/api/users', userData),

  // Update user
  updateUser: (id: string, userData: any) =>
    apiClient.put(`/api/users/${id}`, userData),

  // Delete user
  deleteUser: (id: string) =>
    apiClient.delete(`/api/users/${id}`),

  // Get all users
  getAllUsers: () =>
    apiClient.get('/api/users'),
};
