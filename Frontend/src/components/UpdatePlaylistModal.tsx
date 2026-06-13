import React, { useState, useEffect } from "react";
import { Music, X, Globe, Lock } from "lucide-react"; 

// 1. Định nghĩa cấu trúc Object dữ liệu của Playlist
interface PlaylistDataType {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
}

interface UpdatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistData: PlaylistDataType;
  onUpdateSuccess: (updatedData: PlaylistDataType) => void;
}

const UpdatePlaylistModal: React.FC<UpdatePlaylistModalProps> = ({ isOpen, onClose, playlistData, onUpdateSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true); 
  
  // 🌟 State quản lý tin nhắn báo lỗi (Bình thường để rỗng)
    const [error, setError] = useState(""); 
    // 🌟 Đổ dữ liệu cũ của Playlist vào Form mỗi khi Modal được mở lên
  useEffect(() => {
    if (isOpen && playlistData) {
      setName(playlistData.title);
      setDescription(playlistData.description);
      setIsPublic(playlistData.isPublic);
      setError(""); // Xóa thông báo lỗi cũ nếu có
    }
  }, [isOpen, playlistData]);

  if (!isOpen) return null;

  // Hàm xử lý khi đóng modal (reset toàn bộ dữ liệu và lỗi cũ)
  const handleCloseModal = () => {
    setError(""); 
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
        setError("Vui lòng nhập tên danh sách phát!");
        return;
    }

    // [THÊM MỚI] Gom dữ liệu đã chỉnh sửa
    const updatedPlaylist = {
        ...playlistData, // Giữ nguyên ID cũ (ví dụ: "p1")
        title: name,     // Lấy tên mới từ ô input
        description: description,
        isPublic: isPublic,
    };

    console.log("Dữ liệu chuẩn bị gửi xuống SQL Server hoặc API:", updatedPlaylist);
    
    // [SỬA] Bắn dữ liệu mới sửa về file cha để UI bên ngoài thay đổi lập tức
    onUpdateSuccess(updatedPlaylist);

    handleCloseModal();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
      {/* Khung Modal */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-lg p-6 shadow-2xl relative select-none">
        
        {/* Nút đóng góc phải */}
        <button 
          type="button"
          onClick={handleCloseModal} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Cập nhật danh sách phát</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cụm Layout chính (Bìa giả lập + Ô nhập liệu) */}
          <div className="flex gap-4">
            {/* Bên trái: Hộp vuông ảnh bìa mặc định */}
            <div className="w-40 h-40 bg-zinc-900 border border-zinc-800 rounded flex flex-col items-center justify-center text-zinc-500 shadow-inner shrink-0 group relative">
              <Music size={44} className="text-zinc-600 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-2 text-[10px] text-zinc-500 font-medium text-center px-1">
                Ảnh bìa tự động
              </span>
            </div>

            {/* Bên phải: 2 ô Input (Name & Description) */}
            <div className="flex-1 flex flex-col justify-between space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Tên <span className="text-green-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Thêm tên danh sách phát"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // 🌟 UX cực tốt: Khi người dùng đang gõ lại chữ thì tự động ẩn dòng báo lỗi đỏ đi liền
                    if (error) setError(""); 
                  }}
                  maxLength={255}
                  /* 🌟 Nếu có lỗi thì đổi viền đỏ rực (border-red-500), không có lỗi thì viền trong suốt như cũ */
                  className={`w-full bg-zinc-800 text-white text-sm p-2.5 rounded focus:outline-none transition-all placeholder-zinc-500 border ${
                    error 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-transparent focus:border-zinc-700"
                  }`}
                />
                
                {/* 🌟 ĐOẠN HIỂN THỊ CHỮ ĐỎ BÁO LỖI (Y hệt mẫu ảnh bạn gửi) */}
                {error && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 animate-[fadeIn_0.15s_ease-out]">
                    {error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Mô tả</label>
                <textarea
                  placeholder="Thêm mô tả (không bắt buộc)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-800 text-white text-sm p-2.5 rounded focus:outline-none border border-transparent focus:border-zinc-700 transition-colors placeholder-zinc-500 resize-none h-[76px] custom-scrollbar"
                />
              </div>
            </div>
          </div>

          {/* Hàng chọn Trạng thái: Public / Private */}
          <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-md border border-zinc-900">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe size={20} className="text-green-500 shrink-0" />
              ) : (
                <Lock size={20} className="text-zinc-400 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">
                  {isPublic ? "Chế độ Công khai" : "Chế độ Riêng tư"}
                </span>
                <span className="text-xs text-zinc-400">
                  {isPublic ? "Mọi người đều có thể nghe thấy" : "Chỉ một mình bạn có thể xem"}
                </span>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          {/* Nút bấm Cập nhật */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-white text-black font-bold text-sm px-7 py-2.5 rounded-full hover:scale-105 transition-transform cursor-pointer shadow-md"
            >
              Cập nhật playlist
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default UpdatePlaylistModal;