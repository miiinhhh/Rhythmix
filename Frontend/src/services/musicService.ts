// //BE gia
import { MOCK_PLAYLISTS } from "../data/mockData";

export type SongType = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
};

export type PlaylistType = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  isPublic: boolean;
  type: "playlists" | "albums";
  songs: SongType[];
};

export type RecentTrackType = {
  song: SongType;
  playedAt: Date;
};

// Biến này nằm trong RAM, thay đổi thoải mái lúc app đang chạy, F5 sẽ về mặc định
let playlistsState: PlaylistType[] = structuredClone(MOCK_PLAYLISTS);
let recentState: { song: SongType; playedAt: Date }[] = [];

export const musicService = {
  getPlaylists() {
    return playlistsState;
  },

  getPublicPlaylists() {
    return playlistsState.filter((p) => p.isPublic);
  },

  // QUẢN LÝ DANH SÁCH LIKED SONGS ĐỘNG TRONG RAM
  getLikedSongs() {
    const allSongs = playlistsState.flatMap((p) => p.songs);

    const uniqueSongs = allSongs.filter(
      (song, index, self) => self.findIndex((s) => s.id === song.id) === index
    );

    return uniqueSongs.filter((s) => s.isLiked);
  },

  // HÀM LƯU THỨ TỰ KÉO THẢ VÀO RAM
  saveLikedSongsOrder(reorderedSongs: SongType[]) {
    playlistsState = playlistsState.map((p) => {
      if (p.id === "liked-songs") {
        return { ...p, songs: reorderedSongs };
      }
      return p;
    });
    return reorderedSongs;
  },

  getRecentSongs() {
    return recentState;
  },

  getPlaylistById(id: string) {
    if (id === "liked-songs") {
      const playlist = playlistsState.find((p) => p.id === id);
      return playlist ? { ...playlist, songs: this.getLikedSongs() } : undefined;
    }
    return playlistsState.find((p) => p.id === id);
  },

  togglePlaylistPublic(id: string) {
    playlistsState = playlistsState.map((p) =>
      p.id === id ? { ...p, isPublic: !p.isPublic } : p
    );
    return this.getPlaylistById(id);
  },

  updatePlaylist(id: string, data: Partial<PlaylistType>) {
    playlistsState = playlistsState.map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    return this.getPlaylistById(id);
  },

  // CẬP NHẬT TRẠNG THÁI TIM (LIKE / UNLIKE)
  toggleSongLike(songId: number) {
    let currentStatus = false;

    const song = this.getSongById(songId);
    if (song) {
      currentStatus = !song.isLiked;
    }

    playlistsState = playlistsState.map((playlist) => {
      if (playlist.id === "liked-songs") return playlist;
      return {
        ...playlist,
        songs: playlist.songs.map((s) =>
          s.id === songId ? { ...s, isLiked: currentStatus } : s
        ),
      };
    });

    const likedPlaylist = playlistsState.find((p) => p.id === "liked-songs");
    if (likedPlaylist) {
      if (currentStatus) {
        const targetSong = this.getSongById(songId);
        if (targetSong && !likedPlaylist.songs.some((s) => s.id === songId)) {
          likedPlaylist.songs.push({ ...targetSong, isLiked: true });
        }
      } else {
        likedPlaylist.songs = likedPlaylist.songs.filter((s) => s.id !== songId);
      }
    }

    return this.getSongById(songId);
  },

  getSongById(songId: number) {
    return playlistsState.flatMap((p) => p.songs).find((s) => s.id === songId);
  },

  addRecentSong(song: SongType) {
    const filtered = recentState.filter((item) => item.song.id !== song.id);
    recentState = [{ song, playedAt: new Date() }, ...filtered].slice(0, 10);
    return recentState;
  },

  deleteSongFromPlaylist(playlistId: string, songId: number) {
    playlistsState = playlistsState.map((p) =>
      p.id === playlistId
        ? { ...p, songs: p.songs.filter((s) => s.id !== songId) }
        : p
    );
    return this.getPlaylistById(playlistId);
  },

  addSongToPlaylist(playlistId: string, song: SongType) {
    playlistsState = playlistsState.map((p) =>
      p.id === playlistId ? { ...p, songs: [...p.songs, song] } : p
    );
    return this.getPlaylistById(playlistId);
  },

  deletePlaylist: (playlistId: string) => {
    const currentPlaylists = JSON.parse(localStorage.getItem("myPlaylists") || "[]");
    const updated = currentPlaylists.filter((p: any) => p.id !== playlistId);
    localStorage.setItem("myPlaylists", JSON.stringify(updated));
    return updated;
  },

  getAllPlaylists: () => {
    return JSON.parse(localStorage.getItem("myPlaylists") || "[]");
  },
};

