import React, { useState } from "react";
import { PlusCircle, Plus, Check } from "lucide-react"; // Import thêm icon Check

interface SongType {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
}

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSongs: SongType[];             // Danh sách tất cả bài hát từ DB
  currentPlaylistSongs: SongType[]; // 🌟 Nhận danh sách bài hát ĐANG CÓ SẴN trong playlist để check trùng
  onAddSongSuccess: (song: SongType) => void; // 🌟 THÊM MỚI: Hàm báo về file cha khi add thành công
}

const AddSongModal: React.FC<AddSongModalProps> = ({ 
  isOpen, 
  onClose, 
  allSongs, 
  currentPlaylistSongs,
  onAddSongSuccess, // 🌟 Nhận hàm báo về khi add thành công
}) => {
  const [songSearchQuery, setSongSearchQuery] = useState("");

  // Nếu state isOpen = false thì không render gì hết
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
      {/* Khung Modal */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-xl h-[80vh] flex flex-col shadow-2xl relative">
        
        {/* Header của Modal */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Plus size={20} className="mr-2 text-zinc-400" />
            Thêm vào danh sách phát này
          </h2>
          <button 
            type="button"
            onClick={() => {
              onClose();
              setSongSearchQuery(""); // Reset tìm kiếm khi đóng
            }}
            className="text-zinc-400 hover:text-white text-sm font-semibold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>

        {/* Thanh Tìm Kiếm */}
        <div className="p-4 bg-zinc-900/50">
          <input
            type="text"
            placeholder="Tìm kiếm bài hát để thêm..."
            value={songSearchQuery}
            onChange={(e) => setSongSearchQuery(e.target.value)}
            className="w-full bg-zinc-800 text-white placeholder-zinc-400 text-sm pl-4 pr-4 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 border border-transparent"
          />
        </div>

        {/* Danh sách bài hát cuộn độc lập */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 select-none custom-scrollbar">
          {allSongs
            .filter((song) => {
              // Lọc danh sách theo từ khóa tìm kiếm (Tên bài hát hoặc Ca sĩ)
              return (
                song.title.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
                song.artist.toLowerCase().includes(songSearchQuery.toLowerCase())
              );
            })
            .map((song) => {
              // 🌟 LOGIC KIỂM TRA: Bài hát này ĐÃ ĐƯỢC THÊM vào playlist hiện tại chưa?
              const isAlreadyAdded = currentPlaylistSongs.some(
                (playlistSong) => playlistSong.id === song.id
              );

              return (
                <div 
                  key={song.id}
                  className="flex items-center justify-between p-2 hover:bg-zinc-800/60 rounded-md transition-colors group"
                >
                  {/* Cụm thông tin bài hát */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center shrink-0 text-sm">
                      🎵
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-white truncate">{song.title}</p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  {/* Nút thao tác thay đổi UI linh hoạt dựa vào trạng thái trùng */}
                  {isAlreadyAdded ? (
                    // 1. Nếu ĐÃ ĐƯỢC THÊM: Hiện dấu tích v xanh lá chuẩn chỉnh, không bấm được nữa
                    <div className="p-1 text-green-500" title="Đã có trong playlist">
                      <Check size={22} className="stroke-[3]" /> 
                    </div>
                  ) : (
                    // 2. Nếu CHƯA ĐƯỢC THÊM: Hiện PlusCircle để click thêm vào
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSongSuccess(song);
                        alert(`Đã thêm bài "${song.title}" vào playlist thành công!`);
                        // Mốt kết nối DB: Gọi API add bài hát vào playlist tại đây
                      }}
                      className="text-zinc-400 hover:text-white transition-all cursor-pointer p-1"
                      title="Thêm vào playlist"
                    >
                      <PlusCircle size={22} className="hover:scale-110 transition-transform block" />
                    </button>
                  )}
                </div>
              );
            })}

          {/* Trường hợp tìm không ra bài nào */}
          {allSongs.filter(s => s.title.toLowerCase().includes(songSearchQuery.toLowerCase()) || s.artist.toLowerCase().includes(songSearchQuery.toLowerCase())).length === 0 && (
            <div className="text-center text-sm text-zinc-500 py-8">
              Không tìm thấy bài hát phù hợp.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddSongModal;