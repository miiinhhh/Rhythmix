import apiClient from './apiClient';

export const playlistService = {
  getAll: () => apiClient.get('/playlists'),
  create: (data: { name: string; description: string }) => apiClient.post('/playlists', data),
  addMedia: (playlistId: string, mediaId: string) => 
    apiClient.post(`/playlists/${playlistId}/media`, { mediaId }),
  delete: (playlistId: string) => apiClient.delete(`/playlists/${playlistId}`),
};