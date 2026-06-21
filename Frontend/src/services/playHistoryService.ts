import apiClient from "../api/apiClient";

export interface PlayHistoryItemDto {
  mediaId: string;
  playedAt: string;
}

export const playHistoryService = {
  async getMyHistories(take = 10): Promise<PlayHistoryItemDto[]> {
    const response = await apiClient.get<PlayHistoryItemDto[]>(
      `/play-histories?take=${take}`,
    );

    return response.data;
  },

  async add(mediaId: string): Promise<void> {
    await apiClient.post("/play-histories", { mediaId });
  },

  async clear(): Promise<void> {
    await apiClient.delete("/play-histories");
  },
};
