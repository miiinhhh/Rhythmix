import apiClient from './apiClient';
import { API_BASE_URL } from '../config/apiConfig';
import type { ApiResponse, MediaItemDto, UploadMediaDto } from '../types/api';

export const mediaService = {
  // Upload a new media file (audio or video)
  uploadMedia: async (data: UploadMediaDto) => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.coverImage) formData.append('coverImage', data.coverImage);
    formData.append('title', data.title);
    if (data.artistName) formData.append('artistName', data.artistName);
    if (data.description) formData.append('description', data.description);
    if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));
    if (data.albumId) formData.append('albumId', data.albumId);
    if (data.genreId) formData.append('genreId', data.genreId);
    data.genreIds?.forEach((genreId) => formData.append('genreIds', genreId));
    if (data.videoFile) formData.append('videoFile', data.videoFile);

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
    return `${API_BASE_URL}/api/media/${mediaId}/stream`;
  },

  // Stream phần video đi kèm (nếu có)
  getMediaVideoStream: (mediaId: string) => {
    return `http://localhost:5269/api/media/${mediaId}/stream?type=video`;
  },

  // Get discovery/recommended media
  getDiscovery: async () => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>('/media/discovery');
    return res.data.data;
  },

  // Get media uploaded by the current user
  getMyMedia: async () => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>('/media/my-media');
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

