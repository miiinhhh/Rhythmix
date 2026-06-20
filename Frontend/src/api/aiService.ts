import apiClient from './apiClient';
type RecommendationResponse = {
  success: boolean;
  data: any[];
  source: "openrouter" | "database";
  reason?: string;
};

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
    const res = await apiClient.get<RecommendationResponse>(
      `/ai/recommendations?limit=${limit}`
    );
    return { items: res.data.data, source: res.data.source, reason: res.data.reason };
  },
};
