import apiClient from './apiClient';
import type { ApiResponse, CreateShareDto, ShareItemDto } from '../types/api';

export const shareService = {
  create: async (data: CreateShareDto) => {
    const res = await apiClient.post<ApiResponse<ShareItemDto>>('/Shares', data);
    return res.data.data;
  },

  getInbox: async () => {
    const res = await apiClient.get<ApiResponse<ShareItemDto[]>>('/Shares/inbox');
    return res.data.data;
  },

  getOutbox: async () => {
    const res = await apiClient.get<ApiResponse<ShareItemDto[]>>('/Shares/outbox');
    return res.data.data;
  },
};
