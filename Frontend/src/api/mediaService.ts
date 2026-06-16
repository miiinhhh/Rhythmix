import apiClient from './apiClient';
import type { ApiResponse, MediaItemDto, UploadMediaDto } from '../types/api';

export const mediaService = {
  // Upload a new media file (audio or video)
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

  // Get a single media item by ID
  getMedia: async (mediaId: string) => {
    const res = await apiClient.get<ApiResponse<MediaItemDto>>(`/media/${mediaId}`);
    return res.data.data;
  },

  // Stream a media file
  getMediaStream: (mediaId: string) => {
    return `http://localhost:5269/api/media/${mediaId}/stream`;
  },

  // Get discovery/recommended media
  getDiscovery: async () => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>('/media/discovery');
    return res.data.data;
  },

  // Search media
  search: async (query: string) => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>(
      `/media/search?q=${encodeURIComponent(query)}`
    );
    return res.data.data;
  },

  // Delete a media item
  deleteMedia: async (mediaId: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/media/${mediaId}`);
    return res.data.success;
  },

  // Get media items for a specific user
  getUserMedia: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>(`/media/user/${userId}`);
    return res.data.data;
  },
};

