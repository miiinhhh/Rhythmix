import apiClient from './apiClient';
import type { UserProfileDto, ApiResponse, ArtistDto } from '../types/api';

type FollowStatusResponse = { isFollowing?: boolean; IsFollowing?: boolean };
type FollowCountsResponse = {
  followersCount?: number;
  followingCount?: number;
  FollowersCount?: number;
  FollowingCount?: number;
};

type ToggleFollowResponse = { isFollowing?: boolean; IsFollowing?: boolean; message?: string; Message?: string };

/**
 * Follows/Follow service for user relationships
 * Manage following/followers
 */
export const followService = {
  /**
   * Follow a user
   * Requires: Authorization
   */
  toggleUser: async (userId: string) => {
    const res = await apiClient.post<ApiResponse<ToggleFollowResponse>>(`/follows/users/${userId}`, {});
    return res.data.data;
  },

  follow: async (userId: string) => {
    const result = await followService.toggleUser(userId);
    return result?.isFollowing ?? result?.IsFollowing ?? true;
  },

  /**
   * Check if current user is following a specific user
   */
  isFollowing: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<FollowStatusResponse>>(`/follows/users/${userId}/status`);
    return res.data.data?.isFollowing ?? res.data.data?.IsFollowing ?? false;
  },

  /**
   * Get list of users that the current user is following
   * Requires: Authorization
   */
  getFollowing: async (userId?: string) => {
    const id = userId || localStorage.getItem('currentUserId');
    const res = await apiClient.get<ApiResponse<UserProfileDto[]>>(`/follows/users/${id}/following`);
    return res.data.data;
  },

  /**
   * Get list of followers for a user
   */
  getFollowers: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<UserProfileDto[]>>(`/follows/users/${userId}/followers`);
    return res.data.data;
  },

  /**
   * Get follower count for a user
   */
  getFollowerCount: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<FollowCountsResponse>>(`/follows/users/${userId}/counts`);
    return res.data.data?.followersCount ?? res.data.data?.FollowersCount ?? 0;
  },

  getUserCounts: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<FollowCountsResponse>>(`/follows/users/${userId}/counts`);
    return {
      followersCount: res.data.data?.followersCount ?? res.data.data?.FollowersCount ?? 0,
      followingCount: res.data.data?.followingCount ?? res.data.data?.FollowingCount ?? 0,
    };
  },

  toggleArtist: async (artistId: string) => {
    const res = await apiClient.post<ApiResponse<ToggleFollowResponse>>(`/follows/artists/${artistId}`, {});
    return res.data.data;
  },

  isFollowingArtist: async (artistId: string) => {
    const res = await apiClient.get<ApiResponse<FollowStatusResponse>>(`/follows/artists/${artistId}/status`);
    return res.data.data?.isFollowing ?? res.data.data?.IsFollowing ?? false;
  },

  getArtistFollowerCount: async (artistId: string) => {
    const res = await apiClient.get<ApiResponse<FollowCountsResponse>>(`/follows/artists/${artistId}/count`);
    return res.data.data?.followersCount ?? res.data.data?.FollowersCount ?? 0;
  },

  getFollowingArtists: async () => {
    const res = await apiClient.get<ApiResponse<ArtistDto[]>>('/follows/artists/following');
    return res.data.data;
  },

  getFollowingArtistsByUser: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<ArtistDto[]>>(`/follows/users/${userId}/artists/following`);
    return res.data.data;
  },
};
