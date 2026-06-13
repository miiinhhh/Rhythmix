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
  playedAt: Date; // Lưu mốc thời gian thực khi bài hát được phát
};
    
// Biến này nằm trong RAM, thay đổi thoải mái lúc app đang chạy, F5 sẽ về mặc định[cite: 1]
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
    // flatMap sẽ lấy mảng songs của từng playlist và gộp chung lại thành 1 mảng bài hát duy nhất
    const allSongs = playlistsState.flatMap((p) => p.songs);
    
    // Lọc trùng (nếu một bài hát xuất hiện ở nhiều playlist khác nhau)
    const uniqueSongs = allSongs.filter(
      (song, index, self) => self.findIndex((s) => s.id === song.id) === index
    );

    // Chỉ trả về những bài hát có thuộc tính isLiked === true
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

    // 1. Tìm xem trạng thái hiện tại của bài hát là gì và đảo ngược nó
    const song = this.getSongById(songId);
    if (song) {
      currentStatus = !song.isLiked;
    }

    // 2. Cập nhật thuộc tính isLiked ở TẤT CẢ các playlist chứa bài này[cite: 1]
    playlistsState = playlistsState.map((playlist) => {
      if (playlist.id === "liked-songs") return playlist; // Playlist này xử lý riêng ở dưới
      return {
        ...playlist,
        songs: playlist.songs.map((s) =>
          s.id === songId ? { ...s, isLiked: currentStatus } : s
        ),
      };
    });

    // 3. Xử lý trực tiếp trên mảng của playlist "liked-songs" để giữ/xóa bài hát
    const likedPlaylist = playlistsState.find((p) => p.id === "liked-songs");
    if (likedPlaylist) {
      if (currentStatus) {
        // Nếu là LIKE: Lấy thông tin bài hát bỏ vào cuối mảng Liked Songs
        const targetSong = this.getSongById(songId);
        if (targetSong && !likedPlaylist.songs.some((s) => s.id === songId)) {
          likedPlaylist.songs.push({ ...targetSong, isLiked: true });
        }
      } else {
        // Nếu là UNLIKE: Xóa thẳng bài hát ra khỏi danh sách Liked Songs
        likedPlaylist.songs = likedPlaylist.songs.filter((s) => s.id !== songId);
      }
    }

    return this.getSongById(songId);
  },

  getSongById(songId: number) {
    return playlistsState.flatMap((p) => p.songs).find((s) => s.id === songId);
  },

  addRecentSong(song: SongType) {
    // 1. Lọc bỏ bài hát này nếu nó đã tồn tại trước đó trong lịch sử (để tránh trùng lặp bản ghi)
    const filtered = recentState.filter((item) => item.song.id !== song.id);

    // 2. Đẩy bài mới nhất lên ĐẦU MẢNG kèm thời gian hiện tại (Tự động đạt điều kiện Descending - giảm dần)
    recentState = [{ song, playedAt: new Date() }, ...filtered].slice(0, 10); // Giữ tối đa 10 bài
    
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
};