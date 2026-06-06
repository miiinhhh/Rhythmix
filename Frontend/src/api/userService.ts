import apiClient from './apiClient';

export const userService = {
  getFavorites: () => apiClient.get('/user/favorites'),
  toggleFavorite: (mediaId: string) => apiClient.post('/user/favorites', { mediaId }),
  getHistory: () => apiClient.get('/user/history'),
};