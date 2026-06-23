import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemTitle: string; 
  type: "song" | "playlist" | "album"; // Dùng để phân biệt loại đối tượng
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
  isOpen, onClose, onConfirm, itemTitle, type 
}) => {
  if (!isOpen) return null;

  // Cấu hình nội dung hiển thị dựa trên loại đối tượng (type)
  const config = {
    song: {
      title: "Xóa bài hát?",
      message: (
        <>Bạn có chắc chắn muốn xóa bài hát <span className="text-white font-semibold">"{itemTitle}"</span> khỏi danh sách phát này không?</>
      ),
      buttonText: "Xóa bài hát"
    },
    playlist: {
      title: "Xóa playlist?",
      message: (
        <>Bạn có chắc chắn muốn xóa playlist <span className="text-white font-semibold">"{itemTitle}"</span> khỏi thư viện không? Hành động này không thể hoàn tác.</>
      ),
      buttonText: "Xóa playlist"
    },
    album: {
      title: "Xóa album?",
      message: (
        <>Bạn có chắc chắn muốn xóa album <span className="text-white font-semibold">"{itemTitle}"</span> khỏi thư viện không? Hành động này không thể hoàn tác.</>
      ),
      buttonText: "Xóa album"
    }
  };

  const currentConfig = config[type];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] animate-[fadeIn_0.15s_ease-out]">
      {/* Khung Modal */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-sm p-6 shadow-2xl relative select-none">
        
        {/* Nút đóng góc phải */}
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        {/* Nội dung cảnh báo */}
        <div className="flex flex-col items-center text-center mt-2">
          {/* Icon cảnh báo */}
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">{currentConfig.title}</h3>
          <p className="text-sm text-zinc-400 px-2 leading-relaxed">
            {currentConfig.message}
          </p>
        </div>

        {/* Cụm nút bấm Hủy / Xóa */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-zinc-800 text-zinc-300 font-semibold text-sm py-2.5 rounded-full hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-red-600 text-white font-semibold text-sm py-2.5 rounded-full hover:bg-red-500 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-red-900/20"
          >
            {currentConfig.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;