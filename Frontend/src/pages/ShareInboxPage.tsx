import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Mail,
  Play,
  Music2,
  Send,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Pause,
  ListMusic,
  ArrowRight,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useSearchParams } from "react-router-dom";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  sharedType: "song" | "video" | "playlist";
  time: string;
  avatarColor?: string;
  trackData?: { id: number; title: string; artist: string };
  playlistData?: { id: string; title: string; description: string };
}

// 🟢 Định nghĩa Interface chuẩn cho phần Context nhận từ AppLayout xuống
interface OutletContextType {
  currentSongId: number | null;
  setCurrentSongId: (id: number | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  // songs: any[];
  // allMessages: any[]; 
  onOpenVideo?: () => void;
  onNavigateToPlaylist?: (playlistId: string) => void; // 🟢 Nhận thêm hàm điều hướng playlist
}

const formatTimeAgo = (isoString: string): string => {
  try {
    const messageDate = new Date(isoString);
    const now = new Date();
    
    // Tính khoảng cách thời gian theo mili-giây
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Vừa xong";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    // Nếu quá 7 ngày thì hiển thị ngày tháng năm bình thường luôn cho gọn
    return messageDate.toLocaleDateString("vi-VN");
  } catch (error) {
    return "Vừa xong"; // Fallback phòng hờ dữ liệu cũ bị lỗi dạng chuỗi
  }
}

const ShareInboxPage = () => {
  // 1. Lấy dữ liệu Context trước
  const { allMessages } = useNotifications(); 
  const typedMessages = allMessages as Message[] || [];
  const context = useOutletContext<OutletContextType>();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 2. KHAI BÁO STATE CẦN THIẾT TRƯỚC (Để useEffect dùng được)
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;
  const currentUserId = localStorage.getItem("currentUserId") || "user-alex";

  // 3. TÍNH TOÁN CÁC BIẾN CẦN THIẾT (Phải nằm TRƯỚC useEffect)
  const receivedMessages = typedMessages.filter((msg) => msg.receiverId === currentUserId);
  const sentMessages = typedMessages.filter((msg) => msg.senderId === currentUserId);
  const currentMessages = activeTab === "received" ? receivedMessages : sentMessages;
  const isSentTab = activeTab === "sent";
  
  const totalPages = Math.ceil(currentMessages.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentMessages.slice(indexOfFirstItem, indexOfLastItem);

  // 4. BÂY GIỜ MỚI ĐẾN CÁC useEffect
  useEffect(() => {
    if (highlightId) {
      // Dùng String() để tránh lỗi so sánh số với chữ
      const itemIndex = currentMessages.findIndex(m => String(m.id) === String(highlightId));
      if (itemIndex !== -1) {
        const page = Math.floor(itemIndex / itemsPerPage) + 1;
        if (page !== currentPage) {
          setCurrentPage(page);
        }
      }
    }
  }, [highlightId, currentMessages, itemsPerPage]); 

  useEffect(() => {
    // Chỉ chạy khi có highlightId và phần tử đó đã tồn tại trong danh sách ref
    if (highlightId && itemRefs.current[highlightId]) {
      const element = itemRefs.current[highlightId];
      
      // 1. Cuộn đến phần tử
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      

      element.style.transition = "background-color 0.5s ease";
      element.style.backgroundColor = "#27272a"; // Màu của zinc-800

      setTimeout(() => {
        element.style.backgroundColor = ""; // Xóa style để quay về mặc định
      }, 2000);
      
      // 3. Xóa class sau 2 giây
      const timer = setTimeout(() => {
        element.style.backgroundColor = "";
      }, 2000);

      // 4. Cleanup function: Dọn dẹp timer nếu user đổi trang hoặc highlightId thay đổi trước 2s
      return () => clearTimeout(timer);
    }
  }, [highlightId, currentPage]); // Chỉ cần phụ thuộc vào ID và Trang hiện tại

  const { 
    currentSongId, setCurrentSongId, isPlaying, setIsPlaying, 
    onOpenVideo, onNavigateToPlaylist 
  } = context;

  const handleTabChange = (tab: "received" | "sent") => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset về trang 1 khi đổi tab tránh bị lỗi vỡ trang
  }

  const setRef = (id: string, el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current[id] = el;
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header trang */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Shared Inbox
          </h1>
          <p className="mt-1 text-pretty text-sm text-zinc-400">
            {isSentTab
              ? "Lịch sử những bài hát, nội dung bạn đã gửi cho người khác."
              : "Xem những bài hát, playlist và tin nhắn bạn bè chia sẻ với bạn."}
          </p>
        </div>
      </div>

      {/* 2 Tab Nhỏ */}
      <div className="flex gap-2 border-b border-zinc-900 pb-3">
        <button
          type="button"
          onClick={() => handleTabChange("received")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            !isSentTab ? "bg-green-500 text-black" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          <Inbox className="size-4" />
          Đã chia sẻ với tôi
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("sent")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            isSentTab ? "bg-green-500 text-black" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          <Send className="size-4" />
          Đã gửi cho người khác
        </button>
      </div>

      {/* Danh sách hiển thị tin nhắn/bài nhạc */}
      <div className="space-y-3">
        {currentMessages.length > 0 ? (
          currentItems.map((item) => {
            // Tính toán tên người hiển thị động theo Tab để không bị lộn ngược danh tính
            const displayName = isSentTab ? (item.receiverName || "Người nhận") : (item.senderName || "Người gửi");
            const isPlaylistType = item.sharedType === "playlist"; // 🟢 Biến cờ kiểm tra loại playlist
            return (
              <div
                key={item.id}
                ref={(el) => setRef(item.id, el)}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl transition-all border 
                ${isSentTab 
                  ? "bg-zinc-900/20 border-zinc-800/30 hover:border-zinc-700 hover:shadow-lg" 
                  : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700 hover:shadow-lg"}
                hover:bg-zinc-800/30` // Thêm hiệu ứng đổi màu khi hover
              }
              >
                <div className="flex gap-4 items-start w-full">
                  {/* Avatar đại diện dựa theo chữ cái đầu của Tên */}
                  <div
                    className={`size-10 rounded-full flex items-center justify-center text-black font-bold shrink-0 ${item.avatarColor || "bg-zinc-600"} ${isSentTab && "opacity-80"}`}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Khung nội dung chữ */}
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      {isSentTab ? (
                        <>
                          <span className="text-xs text-zinc-400">Bạn đã gửi cho</span>
                          <span className="font-semibold text-white text-sm">{displayName}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-white text-sm">{displayName}</span>
                          <span className="text-xs text-zinc-400">đã gửi cho bạn</span>
                        </>
                      )}
                      <span className="text-xs text-zinc-500">• {formatTimeAgo(item.time)}</span>
                    </div>

                    {/* 🟢 KHUNG HỘP HIỂN THỊ PLAYLIST ĐƯỢC CHIA SẺ */}
                    {isPlaylistType && item.playlistData && (
                      <div
                        onClick={() => {
                          if (onNavigateToPlaylist && item.playlistData?.id) {
                            onNavigateToPlaylist(item.playlistData.id);
                          }
                        }}
                        className="mt-2 flex items-center gap-3 bg-zinc-950/60 p-2 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 max-w-sm group/item transition-all cursor-pointer active:scale-[0.98] select-none"
                      >
                        <div className="size-10 bg-emerald-950/40 border border-emerald-500/20 rounded flex items-center justify-center text-emerald-400 shrink-0 relative">
                          <ListMusic className="size-5 group-hover/item:scale-110 transition-transform" />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <p className="text-xs font-semibold text-white truncate group-hover/item:text-emerald-400 transition-colors">
                            {item.playlistData.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {item.playlistData.description || "Playlist được chia sẻ"}
                          </p>
                        </div>
                        <div className="text-zinc-500 group-hover/item:text-emerald-400 transition-colors pr-1">
                          <ArrowRight className="size-4" />
                        </div>
                      </div>
                    )}

                    {/* 🔴 KHUNG HỘP NHẠC ĐÍNH KÈM BÀI HÁT / VIDEO (Chỉ chạy khi không phải playlist) */}
                    {!isPlaylistType && item.trackData && (
                      <div
                        onClick={() => {
                          const trackId = item.trackData?.id;
                          if (trackId === undefined) return;

                          const isCurrentPlaying = currentSongId === trackId;
                          if (setCurrentSongId) setCurrentSongId(trackId);
                          if (setIsPlaying) setIsPlaying(isCurrentPlaying ? !isPlaying : true);
                          
                          if (item.sharedType === "video" && onOpenVideo) {
                            setTimeout(() => onOpenVideo(), 50);
                          }
                        }}
                        className="mt-2 flex items-center gap-3 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800 max-w-sm group/item hover:border-zinc-700 transition-colors cursor-pointer active:scale-[0.98] select-none"
                      >
                        <div className="size-10 bg-zinc-800 rounded flex items-center justify-center text-zinc-400 shrink-0 relative">
                          {currentSongId === item.trackData.id && isPlaying ? (
                            <Pause className="size-4 fill-white text-white absolute opacity-100 transition-opacity" />
                          ) : (
                            <>
                              <Music2 className="size-5 group-hover/item:opacity-0 transition-opacity" />
                              <Play className="size-4 fill-white text-white absolute opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-white truncate">{item.trackData.title}</p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {item.sharedType === "song"
                              ? `Bài hát · ${item.trackData.artist}`
                              : `Video · ${item.trackData.artist}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Trạng thái trống (Empty State) */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/10 rounded-xl border border-dashed border-zinc-800">
            {isSentTab ? <Send className="mb-3 size-10 text-zinc-600" /> : <Mail className="mb-3 size-10 text-zinc-600" />}
            <p className="text-sm text-zinc-400">
              {isSentTab ? "Bạn chưa gửi nội dung nào cho bạn bè." : "Không có nội dung nào được chia sẻ với bạn."}
            </p>
          </div>
        )}
      </div>

      {/* Điều khiển Thanh phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-400">
            Đang hiện trang <span className="text-white font-medium">{currentPage}</span> trên tổng số{" "}
            <span className="text-white font-medium">{totalPages}</span> trang
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-8 rounded border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center size-8 rounded border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default ShareInboxPage;