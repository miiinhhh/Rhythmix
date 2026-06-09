import React, { useState, useEffect } from "react";
import { Play, Clock, Heart, Pause, Share2, Trash2, Plus, Pencil, Globe, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import AddSongModal from "../components/AddSongModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import UpdatePlaylistModal from "../components/UpdatePlaylistModal";

interface SongType {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
}

const PlaylistDetailPage = () => {
  const navigate = useNavigate();

  const {
    currentSongId,
    setCurrentSongId,
    isPlaying,
    setIsPlaying,
    songs,
    setSongs,
  } = useOutletContext<{
    currentSongId: number | null;
    setCurrentSongId: (id: number | null) => void;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
    songs: SongType[]; // Hứng mảng bài hát tổng
    setSongs: React.Dispatch<React.SetStateAction<SongType[]>>; // Hứng hàm sửa mảng tổng
  }>();

  const [playlistInfo, setPlaylistInfo] = useState({
    id: "p1",
    title: "Daily Mix 1",
    description: "The Weeknd, Dua Lipa and more",
    isPublic: true, // 🟢 true: Hiện quả địa cầu, false: Hiện ổ khóa
  });

  // 2. TOÀN BỘ STATE QUẢN LÝ NẰM TẬP TRUNG TẠI ĐÂY

  const [likedPulse, setLikedPulse] = useState<number[]>([]); // Hiệu ứng tim nhấp nháy
  const currentSong = songs.find((s) => s.id === currentSongId) || null;

  // Hàm xử lý Phát/Tạm dừng nhạc (Dùng chung cho cả click dòng và double click)
  const handlePlaySong = (songId: number) => {
    if (currentSongId === songId) {
      setIsPlaying(!isPlaying); // Đảo trạng thái nếu bấm lại bài cũ
    } else {
      setCurrentSongId(songId); // Đổi sang bài mới
      setIsPlaying(true);
    }
  };

  // Hàm xử lý cho NÚT PLAY LỚN ở trên Header
  const handleTogglePlaylist = () => {
    if (!currentSongId && songs.length > 0) {
      setCurrentSongId(songs[0].id); // Nếu chưa chọn bài nào thì phát bài đầu tiên
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying); // Nếu đang chọn rồi thì đảo trạng thái Play/Pause
    }
  };
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isUpdatePlaylistModalOpen, setIsUpdatePlaylistModalOpen] = useState(false);

  // 2. Tạo các State quản lý Modal xóa
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{ id: number; title: string } | null>(null);

  // 3. Hàm giả lập xử lý hành động Xóa thật sự sau khi user bấm Xác nhận
  const handleDeleteConfirm = () => {
    if (selectedSong) {
      // 1. Cập nhật state cục bộ/tổng để giao diện mất bài hát ngay lập tức
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== selectedSong.id));
      
      // 2. Nếu bài hát đang xóa chính là bài đang phát, hãy tắt nhạc/chuyển bài
      if (selectedSong.id === currentSongId) {
        setCurrentSongId(null);
        setIsPlaying(false);
      }

      console.log(`Đã thực hiện xóa bài hát có ID: ${selectedSong.id} khỏi Database`);
      setIsDeleteOpen(false); // Đóng modal
      setSelectedSong(null); // Reset state
    }
  };
  
  return (
    <div className="flex-grow bg-zinc-900 text-white p-6">
      {/* NÚT BACK CHUẨN UX/UI */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center bg-zinc-800 text-sm font-bold text-white py-2 px-4 rounded-full mb-6 hover:bg-zinc-700 active:scale-95 transition-all"
      >
        <span className="mr-1.5 text-base font-light">&lt;</span> Back
      </button>

      {/* Header Info */}
      <div className="flex items-end gap-6 mb-8">
        <div className="w-44 h-44 shrink-0 bg-gradient-to-br from-green-700 to-zinc-800 rounded-lg flex items-center justify-center shadow-2xl">
          <span className="text-6xl text-zinc-400">🎵</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-300">
            Playlist
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-6xl font-black tracking-tight">
              {playlistInfo.title}
            </h1>
            
            {/* Logic render icon động dựa vào thuộc tính isPublic */}
            <div 
              className="mt-3 text-zinc-400" 
              title={playlistInfo.isPublic ? "Danh sách phát Công khai" : "Danh sách phát Riêng tư"}
            >
              {playlistInfo.isPublic ? (
                <Globe size={24} className="text-green-500" />
              ) : (
                <Lock size={24} className="text-zinc-400" />
              )}
            </div>
          </div>

          <p className="text-sm text-zinc-400">{playlistInfo.description}</p>
          <p className="text-xs text-zinc-300 mt-2 font-medium">
            <span className="text-white font-bold">Soundwave</span> •{" "}
            {songs.length} songs, about 12 min
          </p>
        </div>
      </div>

      {/* 🟢 BONUS 1: ACTION PLAY BUTTON LỚN ĐÃ KẾT NỐI STATE */}
      <div className="flex items-center justify-between w-full mb-8">
      {/* Cụm Trái: Gồm nút Play lớn và Nút Share2 kế bên */}
      <div className="flex items-center gap-5">
        <button
          onClick={handleTogglePlaylist}
          className="bg-green-500 p-4 rounded-full text-black hover:scale-105 active:scale-95 transition-transform shadow-lg cursor-pointer"
        >
          {isPlaying ? (
            <Pause fill="black" size={24} />
          ) : (
            <Play fill="black" size={24} />
          )}
        </button>

        {/* 🌟 THÊM ICON CHIA SẺ (SHARE2) KẾ BÊN NÚT PLAY/PAUSE */}
        <button 
          type="button"
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
          title="Chia sẻ playlist"
        >
          <Share2 size={24} />
          </button>
          {/* 🌟 NÚT "THÊM BÀI NHẠC MỚI" ĐƯỢC CHÈN VÀO ĐÂY */}
          <button
            type="button"
            onClick={() => {setIsAddSongModalOpen(true);}}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 px-4 py-2 text-sm font-semibold transition-all cursor-pointer active:scale-95"
            title="Thêm bài hát mới"
          >
            <Plus className="size-4 stroke-3" /> Add New Song
          </button>
          <button
            type="button"
            onClick={() => {setIsUpdatePlaylistModalOpen(true);}}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 px-4 py-2 text-sm font-semibold transition-all cursor-pointer active:scale-95"
            title="Cập nhật playlist"
          >
            <Pencil className="size-4 stroke-3" /> Update Playlist
          </button>
        </div>
    </div>
  
      {/* BẢNG DANH SÁCH BÀI HÁT */}
      <div className="w-full">
        {/* Header bảng */}
        <div className="grid grid-cols-[40px_1fr_1fr_140px] gap-x-5 items-center text-zinc-400 text-xs uppercase font-bold tracking-wider px-4 py-2 border-b border-zinc-800 mb-3">
          <div className="text-center">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="flex justify-end pr-22">
            <Clock size={16} />
          </div>
        </div>

        {/* Vòng lặp map danh sách bài hát */}
        {songs.map((song, index) => {
          const isCurrent = song.id === currentSongId;

          return (
            <div
              key={song.id}
              // Single Click: Click 1 phát tạm thời vẫn cho chạy nhạc luôn để bạn test giao diện nhanh
              onClick={() => handlePlaySong(song.id)}
              // 🟢 BONUS 2: DOUBLE CLICK ĐÚNG CHUẨN SPOTIFY
              onDoubleClick={() => handlePlaySong(song.id)}
              className="grid grid-cols-[40px_1fr_1fr_140px] gap-x-5 items-center px-4 py-3 rounded-md hover:bg-zinc-850 cursor-pointer group transition-colors select-none"
            >
              {/* CỘT # XỬ LÝ LOGIC BIẾN HÌNH */}
              <div className="text-zinc-400 font-medium text-center flex items-center justify-center min-w-[24px] min-h-[24px]">
                {/* TRƯỜNG HỢP 1: KHI RE CHUỘT VÀO DÒNG */}
                <div className="hidden group-hover:block">
                  {isCurrent && isPlaying ? (
                    <span className="text-white">
                      <Pause fill="white" size={14} />
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn click lan ra ngoài
                        handlePlaySong(song.id);
                      }}
                      className="text-white hover:scale-110 transition-transform"
                    >
                      <Play fill="white" size={14} />
                    </button>
                  )}
                </div>

                {/* TRƯỜNG HỢP 2: TRẠNG THÁI BÌNH THƯỜNG KHI KHÔNG RE CHUỘT */}
                <div className="group-hover:hidden">
                  {isCurrent ? (
                    isPlaying ? (
                      /* Sóng nhạc nhấp nhô */
                      <div className="flex items-end justify-center gap-[3px] h-3.5 w-5 mx-auto">
                        <span className="w-[3px] bg-green-500 rounded-full animate-[bounce_0.8s_infinite_100ms] h-2"></span>
                        <span className="w-[3px] bg-green-500 rounded-full animate-[bounce_0.8s_infinite_300ms] h-3.5"></span>
                        <span className="w-[3px] bg-green-500 rounded-full animate-[bounce_0.8s_infinite_0s] h-1.5"></span>
                        <span className="w-[3px] bg-green-500 rounded-full animate-[bounce_0.8s_infinite_200ms] h-2.5"></span>
                      </div>
                    ) : (
                      /* Sóng nhạc đứng im */
                      <div className="flex items-end justify-center gap-[3px] h-3.5 w-5 mx-auto">
                        <span className="w-[3px] h-2 bg-green-500 rounded-full"></span>
                        <span className="w-[3px] h-3.5 bg-green-500 rounded-full"></span>
                        <span className="w-[3px] h-1.5 bg-green-500 rounded-full"></span>
                        <span className="w-[3px] h-2.5 bg-green-500 rounded-full"></span>
                      </div>
                    )
                  ) : (
                    <span className="text-zinc-400 font-medium">
                      {index + 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Tên bài + Ca sĩ */}
              <div className="min-w-0 pr-4">
                <p
                  className={`text-sm font-semibold truncate ${isCurrent ? "text-green-500" : "text-white"}`}
                >
                  {song.title}
                </p>
                <p className="text-xs text-zinc-400 truncate mt-0.5 group-hover:text-zinc-300">
                  {song.artist}
                </p>
              </div>

              {/* Tên Album */}
              <div className="text-sm text-zinc-400 truncate pr-4 group-hover:text-zinc-300">
                {song.album}
              </div>

              {/* Cột Thời gian + Trái tim + update + delete */}
              <div className="flex items-center justify-end text-sm text-zinc-400 pr-2">
                <div className="flex items-center justify-between gap-x-4 min-w-[140px]">
                  <span className="font-medium text-right flex-1">
                    {song.duration}
                  </span>

                  {/* Nút Trái tim giữ nguyên của bạn */}
                  <div className="w-5 flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSongs((prev) =>
                          prev.map((s) =>
                            s.id === song.id ? { ...s, isLiked: !s.isLiked } : s,
                          ),
                        );
                        setLikedPulse((prev) => [...prev, song.id]);
                        setTimeout(() => {
                          setLikedPulse((prev) => prev.filter((id) => id !== song.id));
                        }, 220);
                      }}
                      aria-label={song.isLiked ? "Unlike" : "Like"}
                    >
                      <Heart
                        size={16}
                        className={`transform transition-transform duration-200 ${
                          song.isLiked
                            ? "text-green-500 fill-green-500"
                            : "text-zinc-400 hover:text-white"
                        } ${likedPulse.includes(song.id) ? "scale-125" : "scale-100"}`}
                      />
                    </button>
                  </div>

                  {/* 🌟 THÊM ICON DELETE (XÓA TRACK) - CHỈ HIỆN KHI HOVER */}
                  <div className="w-5 flex justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Chặn sự kiện click hàng bài hát
                        
                        // 🌟 Thay vì alert(), ta lưu bài hát đang chọn và mở Modal lên!
                        setSelectedSong({ id: song.id, title: song.title });
                        setIsDeleteOpen(true);
                      }}
                      className="text-zinc-400 hover:text-red-400 cursor-pointer"
                      title="Xóa khỏi playlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gọi Modal dùng riêng biệt, truyền state và mảng songs vào */}
      <AddSongModal 
        isOpen={isAddSongModalOpen}
        onClose={() => setIsAddSongModalOpen(false)}
        allSongs={songs} // Truyền mảng danh sách tổng lấy từ useOutletContext qua bài này hưởng
        currentPlaylistSongs={songs} // Truyền mảng danh sách bài hát đang có trong playlist
      />
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        songTitle={selectedSong?.title || ""}
      />
      <UpdatePlaylistModal
        isOpen={isUpdatePlaylistModalOpen}
        onClose={() => setIsUpdatePlaylistModalOpen(false)}
        playlistData={playlistInfo} // Truyền dữ liệu cũ qua
        onUpdateSuccess={(updatedData) => {
          // Nhận data mới từ modal để cập nhật giao diện ngoài này ngay lập tức
          setPlaylistInfo(updatedData);
        }}
      />
    </div>
  );
};

export default PlaylistDetailPage;
