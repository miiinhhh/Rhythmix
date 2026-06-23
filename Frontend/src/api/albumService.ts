import apiClient from "./apiClient";
import type {
  AlbumDetailDto,
  AlbumDto,
  ApiResponse,
  CreateAlbumDto,
} from "../types/api";

const buildAlbumFormData = (data: CreateAlbumDto) => {
  const formData = new FormData();

  formData.append("title", data.title);

  if (data.description) {
    formData.append("description", data.description);
  }

  if (data.coverImage) {
    formData.append("coverImage", data.coverImage);
  }

  return formData;
};

export const albumService = {
  getMyAlbums: async () => {
    const res = await apiClient.get<ApiResponse<AlbumDto[]>>("/albums/my-albums");
    return res.data.data;
  },

  getById: async (albumId: string) => {
    const res = await apiClient.get<ApiResponse<AlbumDetailDto>>(`/albums/${albumId}`);
    return res.data.data;
  },

  create: async (data: CreateAlbumDto) => {
    const formData = buildAlbumFormData(data);

    const res = await apiClient.post<ApiResponse<AlbumDto>>("/albums", formData);

    return res.data.data;
  },

  update: async (albumId: string, data: CreateAlbumDto) => {
    const formData = buildAlbumFormData(data);

    const res = await apiClient.put<ApiResponse<AlbumDto>>(
      `/albums/${albumId}`,
      formData
    );

    return res.data.data;
  },

  delete: async (albumId: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/albums/${albumId}`);
    return res.data.success;
  },
};