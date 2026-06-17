import { mediaService } from "../api/mediaService";
import { playlistService } from "../api/playlistService";
import { mapMediaToSong, type SongType } from "../utils/mediaMapping";
import type { PlaylistDto } from "../types/api";

export type PlaylistType = PlaylistDto;
export type RecentTrackType = {
  song: SongType;
  playedAt: Date;
};

export const musicService = {
  async getSongs() {
    const mediaItems = await mediaService.getDiscovery();
    return mediaItems.map(mapMediaToSong);
  },

  async getMySongs() {
    const mediaItems = await mediaService.getMyMedia();
    return mediaItems.map(mapMediaToSong);
  },

  async getPlaylists() {
    return playlistService.getAll();
  },

  async getPublicPlaylists() {
    const playlists = await playlistService.getAll();
    return playlists.filter((playlist) => playlist.isPublic);
  },

  getLikedSongs(songs: SongType[] = []) {
    return songs.filter((song) => song.isLiked);
  },

  getRecentSongs(): RecentTrackType[] {
    return [];
  },
};
