import apiClient from './apiClient';
import type { PlaylistDto, PlaylistDetailDto, CreatePlaylistDto, PlaylistTrackDto, ApiResponse } from '../types/api';

export const playlistService = {
  /**
   * Get all playlists for the current user
   */
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<PlaylistDto[]>>('/playlists/my-playlists');
    return res.data.data;
  },

  /**
   * Get a single playlist by ID
   */
  getById: async (playlistId: string) => {
    const res = await apiClient.get<ApiResponse<PlaylistDetailDto>>(`/playlists/${playlistId}`);
    return res.data.data;
  },

  /**
   * Get all media items in a playlist
   */
  getMediaItems: async (playlistId: string) => {
    const res = await apiClient.get<ApiResponse<PlaylistDetailDto>>(`/playlists/${playlistId}`);
    return res.data.data.tracks;
  },

  getTracks: async (playlistId: string) => {
    const res = await apiClient.get<ApiResponse<PlaylistDetailDto>>(`/playlists/${playlistId}`);
    return res.data.data.tracks;
  },

  addTrack: async (playlistId: string, mediaId: string, sortOrder = 0) => {
    const res = await apiClient.post<ApiResponse<PlaylistTrackDto>>(`/playlists/${playlistId}/tracks`, { mediaId, sortOrder });
    return res.data.data;
  },

  /**
   * Create a new playlist
   * Requires: Authorization header
   */
  create: async (data: CreatePlaylistDto) => {
    const res = await apiClient.post<ApiResponse<PlaylistDto>>('/playlists', data);
    return res.data.data;
  },

  /**
   * Update playlist metadata
   * Requires: Ownership or admin
   */
  update: async (playlistId: string, data: Partial<CreatePlaylistDto>) => {
    const res = await apiClient.put<ApiResponse<PlaylistDto>>(`/playlists/${playlistId}`, data);
    return res.data.data;
  },

  /**
   * Add a media item to a playlist
   * Requires: Ownership or admin
   */
  addMedia: async (playlistId: string, mediaId: string) => {
    const res = await apiClient.post<ApiResponse<void>>(`/playlists/${playlistId}/tracks`, { mediaId, sortOrder: 0 });
    return res.data.success;
  },

  /**
   * Remove a media item from a playlist
   * Requires: Ownership or admin
   */
  removeMedia: async (playlistId: string, mediaId: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/playlists/${playlistId}/tracks/${mediaId}`);
    return res.data.success;
  },

  /**
   * Delete a playlist
   * Requires: Ownership or admin
   */
  delete: async (playlistId: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/playlists/${playlistId}`);
    return res.data.success;
  },

  /**
   * Get public playlists (for discovery)
   */
  getPublic: async () => {
    const res = await apiClient.get<ApiResponse<PlaylistDto[]>>('/playlists/public');
    return res.data.data;
  },
};
