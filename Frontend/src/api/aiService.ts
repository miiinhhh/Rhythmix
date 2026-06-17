import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

/**
 * AI Recommendation service
 * Fetches personalized song recommendations based on user listening history and favorites
 */
export const aiService = {
  /**
   * Get AI recommendations
   * @param limit - Number of recommendations (default: 10, max: 20)
   * @returns List of recommended MediaItem
   */
  getRecommendations: async (limit: number = 10) => {
    const res = await apiClient.get<ApiResponse<any[]>>(
      `/ai/recommendations?limit=${limit}`
    );
    return res.data.data;
  },
};