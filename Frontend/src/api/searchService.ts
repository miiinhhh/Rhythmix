import apiClient from './apiClient';
import type { SearchResultDto, ApiResponse } from '../types/api';

/**
 * Search service for global content search
 * Searches across media, playlists, and users
 */
export const searchService = {
  /**
   * Global search
   * @param query - Search query string
   * @returns Combined results (media, playlists, users)
   */
  search: async (query: string) => {
    const res = await apiClient.get<ApiResponse<SearchResultDto>>(
      `/search?query=${encodeURIComponent(query)}`
    );
    return res.data.data;
  },

  /**
   * Search only media items
   */
  searchMedia: async (query: string) => {
    const res = await apiClient.get<ApiResponse<any[]>>(
      `/search/media?query=${encodeURIComponent(query)}`
    );
    return res.data.data;
  },

  /**
   * Search only playlists
   */
  searchPlaylists: async (query: string) => {
    const res = await apiClient.get<ApiResponse<any[]>>(
      `/search/playlists?query=${encodeURIComponent(query)}`
    );
    return res.data.data;
  },

  /**
   * Search only users
   */
  searchUsers: async (query: string) => {
    const res = await apiClient.get<ApiResponse<any[]>>(
      `/search/users?query=${encodeURIComponent(query)}`
    );
    return res.data.data;
  },
};
