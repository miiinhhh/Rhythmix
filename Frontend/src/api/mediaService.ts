<<<<<<< HEAD
import apiClient from './apiClient';
import type { MediaItemDto, UploadMediaDto, ApiResponse } from '../types/api';

export const mediaService = {
  /**
   * Upload a new media file (audio or video)
   * Requires: Authorization header with JWT token
   */
  uploadMedia: async (data: UploadMediaDto) => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));
    if (data.albumId) formData.append('albumId', data.albumId);

    const res = await apiClient.post<ApiResponse<MediaItemDto>>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  /**
   * Get a single media item by ID
   */
  getMedia: async (mediaId: string) => {
    const res = await apiClient.get<ApiResponse<MediaItemDto>>(`/media/${mediaId}`);
    return res.data.data;
  },

  /**
   * Stream a media file (returns audio/video stream)
   * Client will set this as <audio> or <video> src
   */
  getMediaStream: (mediaId: string) => {
    return `http://localhost:5269/api/media/${mediaId}/stream`;
  },

  /**
   * Get discovery/recommended media
   */
  getDiscovery: async () => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>('/media/discovery');
    return res.data.data;
  },

  /**
   * Search media by title/description
   */
  search: async (query: string) => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>(`/media/search?q=${encodeURIComponent(query)}`);
    return res.data.data;
  },

  /**
   * Delete a media item (requires ownership or admin)
   */
  deleteMedia: async (mediaId: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/media/${mediaId}`);
    return res.data.success;
  },

  /**
   * Get media items for a specific user
   */
  getUserMedia: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>(`/media/user/${userId}`);
    return res.data.data;
  },
=======
import apiClient from './apiClient';
import { type MediaItem } from '../types/database';

export const mediaService = {
  uploadMedia: (formData: FormData) => apiClient.post('/media/upload', formData),
  getDiscovery: () => apiClient.get<MediaItem[]>('/media/discovery'),
  search: (query: string) => apiClient.get<MediaItem[]>(`/media/search?q=${query}`),
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
};