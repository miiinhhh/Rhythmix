import apiClient from './apiClient';
import type { ApiResponse, GenreDto } from '../types/api';

export const genreService = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<GenreDto[]>>('/genres');
    return res.data.data;
  },
};
