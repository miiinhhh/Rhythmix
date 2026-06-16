import apiClient from './apiClient';
import type {
  ApiResponse,
  MediaItemDto,
  ToggleLikeDto,
  UpdateProfileDto,
  UserProfileDto,
} from '../types/api';

export const userService = {
  /**
   * Get the current user's profile
   * Requires: Authorization
   */
  getCurrentProfile: async () => {
    const res = await apiClient.get<ApiResponse<UserProfileDto>>('/user/profile');
    return res.data.data;
  },

  /**
   * Get the current user's profile (Using /api/Profile/me)
   */
  getCurrentProfileMe: async () => {
    const res = await apiClient.get<ApiResponse<UserProfileDto>>('/Profile/me');
    return res.data.data;
  },

  /**
   * Get another user's public profile
   */
  getProfile: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<UserProfileDto>>(`/user/${userId}/profile`);
    return res.data.data;
  },

  /**
   * Update current user's profile
   * Requires: Authorization
   */
  updateProfile: async (data: UpdateProfileDto) => {
    const res = await apiClient.put<ApiResponse<UserProfileDto>>('/Profile/me', data);
    return res.data.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('File', file);

    const res = await apiClient.post<ApiResponse<{ avatarUrl: string }>>('/Profile/me/avatar', formData);
    return res.data.data.avatarUrl;
  },

  /**
   * Get user's liked/favorite media items
   * Requires: Authorization
   */
  getFavorites: async () => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>('/user/favorites');
    return res.data.data;
  },

  /**
   * Toggle like/favorite status for a media item
   * Requires: Authorization
   */
  toggleFavorite: async (mediaId: string) => {
    const res = await apiClient.post<ApiResponse<ToggleLikeDto>>('/user/favorites', { mediaId });
    return res.data.data;
  },

  /**
   * Check if a media item is liked by the current user
   */
  isFavorited: async (mediaId: string) => {
    const res = await apiClient.get<ApiResponse<boolean>>(`/user/favorites/${mediaId}`);
    return res.data.data;
  },

  /**
   * Get user's play history
   * Requires: Authorization
   */
  getHistory: async () => {
    const res = await apiClient.get<ApiResponse<MediaItemDto[]>>('/user/history');
    return res.data.data;
  },

  /**
   * Clear play history
   * Requires: Authorization
   */
  clearHistory: async () => {
    const res = await apiClient.delete<ApiResponse<void>>('/user/history');
    return res.data.success;
  },
};

