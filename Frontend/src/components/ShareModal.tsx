import { useState, useEffect } from "react";
import { X, Search, Send, Check } from "lucide-react";
import { MOCK_USERS, sendShareItem } from "../data/mockData";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToShare: {
    type: "song" | "playlist" | "video";
    id: string | number;
    title: string;
    subtitle: string;
  };
  onShareSuccess?: (receiverName: string) => void;
}

const ShareModal = ({ isOpen, onClose, itemToShare, onShareSuccess }: ShareModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // State lưu các record đã gửi để đổi màu nút
  const [sentRecords, setSentRecords] = useState<string[]>([]); 

  // Mỗi khi đổi bài hát hoặc đổi tab, reset sạch trạng thái cũ
  useEffect(() => {
    if (isOpen) {
      setSentRecords([]);
      setSearchQuery(""); 
    }
  }, [itemToShare.id, itemToShare.type, isOpen]);

  if (!isOpen) return null;

  // Lấy ID người đang đăng nhập
  const currentUserId = localStorage.getItem("currentUserId") || "user-alex";
  const currentUserName = localStorage.getItem("currentUserName") || "Alex Mercer";

  // Lọc danh sách user
  const filteredUsers = MOCK_USERS.filter(
    (user) =>
      user.id !== currentUserId &&
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🟢 SỬA TẠI ĐÂY: Hàm xử lý bấm nút gửi cho từng người riêng biệt
  const handleSend = (receiverId: string, receiverName: string) => {
    // 1. Ghi dữ liệu thật vào mockData (hoặc LocalStorage) để lưu trữ
    sendShareItem({
      senderId: currentUserId,
      senderName: currentUserName,
      receiverId: receiverId, 
      type: itemToShare.type,
      itemId: itemToShare.id,
      itemTitle: itemToShare.title,
      itemSubtitle: itemToShare.subtitle,
    });

    // 2. Đánh dấu để đổi UI nút bấm sang "✓ Đã gửi"
    const recordKey = `${receiverId}-${itemToShare.type}`;
    setSentRecords((prev) => [...prev, recordKey]);

    // 3. 🟢 ĐẨY DATA LÊN INBOX NGAY LẬP TỨC MÀ KHÔNG LÀM ĐÓNG MODAL
    if (onShareSuccess) {
      onShareSuccess(receiverName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div>
            <h3 className="text-sm font-bold text-white">
              {itemToShare.type === "song" && "Chia sẻ bài hát"}
              {itemToShare.type === "video" && "Chia sẻ Video MV"}
              {itemToShare.type === "playlist" && "Chia sẻ Playlist"}
            </h3>
            <p className="text-xs text-zinc-400 truncate max-w-[250px] mt-0.5">
              Đang chia sẻ: {itemToShare.title}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm tên bạn bè muốn gửi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md bg-zinc-800 py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Danh sách bạn bè */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredUsers.map((user) => {
            const currentRecordKey = `${user.id}-${itemToShare.type}`;
            const hasSent = sentRecords.includes(currentRecordKey);

            return (
              <div key={user.id} className="flex items-center justify-between rounded-lg bg-zinc-800/40 p-2 hover:bg-zinc-800/80 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={user.avatarUrl} alt={user.name} className="size-8 rounded-full object-cover" />
                  <span className="truncate text-xs font-semibold text-white">{user.name}</span>
                </div>
                
                {/* Nút gửi thông minh */}
                <button
                  type="button"
                  onClick={() => handleSend(user.id, user.name)} // Đã truyền đủ 2 tham số
                  disabled={hasSent}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
                    hasSent
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      : "bg-green-500 text-black hover:bg-green-400"
                  }`}
                >
                  {hasSent ? (
                    <>
                      <Check className="size-3" /> Đã gửi
                    </>
                  ) : (
                    <>
                      <Send className="size-3" /> Gửi
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <p className="text-center text-xs text-zinc-500 py-4">Không tìm thấy người dùng này.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;