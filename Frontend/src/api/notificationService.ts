import apiClient from './apiClient';
import type { NotificationDto, ApiResponse } from '../types/api';

/**
 * Notifications service for user notifications
 * Manage notifications, mark as read, etc.
 */
export const notificationService = {
  /**
   * Get all notifications for current user
   * Requires: Authorization
   */
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<NotificationDto[]>>('/notifications');
    return res.data.data;
  },

  /**
   * Get unread notifications count
   * Requires: Authorization
   */
  getUnreadCount: async () => {
    const res = await apiClient.get<ApiResponse<number>>('/notifications/unread/count');
    return res.data.data;
  },

  /**
   * Mark a notification as read
   * Requires: Authorization
   */
  markAsRead: async (notificationId: string) => {
    const res = await apiClient.put<ApiResponse<NotificationDto>>(
      `/notifications/${notificationId}/read`,
      {}
    );
    return res.data.data;
  },

    /**
   * Requires: Authorization

   */
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const res = await apiClient.put<ApiResponse<void>>('/notifications/read/all', {});
      return res.data.success;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return false;
    }
  },

  // /**
  //  * Delete a notification
  //  * Requires: Authorization
  //  */
  // delete: async (notificationId: string) => {
  //   const res = await apiClient.delete<ApiResponse<void>>(`/api/notifications/${notificationId}`);
  //   return res.data.success;
  // },

  // /**
  //  * Delete all notifications
  //  * Requires: Authorization
  //  */
  // deleteAll: async () => {
  //   const res = await apiClient.delete<ApiResponse<void>>('/api/notifications');
  //   return res.data.success;
  // },
};
