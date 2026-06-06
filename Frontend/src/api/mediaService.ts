import apiClient from './apiClient';
import { type MediaItem } from '../types/database';

export const mediaService = {
  uploadMedia: (formData: FormData) => apiClient.post('/media/upload', formData),
  getDiscovery: () => apiClient.get<MediaItem[]>('/media/discovery'),
  search: (query: string) => apiClient.get<MediaItem[]>(`/media/search?q=${query}`),
};