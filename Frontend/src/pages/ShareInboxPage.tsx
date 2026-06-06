import { useState } from "react";
import {
  Mail,
  Play,
  Music2,
  Send,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// 1. Đồng bộ cấu trúc dữ liệu: Dùng chung chữ 'name' cho cả người gửi và nhận
const mockReceivedMessages = [
  {
    id: "r1",
    name: "Nguyễn Văn A", // Đổi từ sender thành name
    avatarColor: "bg-blue-500",
    sharedType: "song",
    sharedName: "Midnight City",
    artist: "M83",
    time: "2 giờ trước",
  },
  {
    id: "r2",
    name: "Trần Thị B", // Đổi từ sender thành name
    avatarColor: "bg-purple-500",
    sharedType: "playlist",
    sharedName: "Chill Vibes 2026",
    artist: "Nhiều nghệ sĩ",
    time: "Yesterday",
  },
  {
    id: "r3",
    name: "Nguyễn Văn C", // Đổi từ sender thành name
    avatarColor: "bg-blue-500",
    sharedType: "song",
    sharedName: "Midnight City",
    artist: "M83",
    time: "2 giờ trước",
  },
  {
    id: "r4",
    name: "Trần Thị D", // Đổi từ sender thành name
    avatarColor: "bg-purple-500",
    sharedType: "playlist",
    sharedName: "Chill Vibes 2026",
    artist: "Nhiều nghệ sĩ",
    time: "Yesterday",
  },
];

const mockSentMessages = [
  {
    id: "s1",
    name: "Trần Thị B", // Đổi từ receiver thành name
    avatarColor: "bg-purple-500",
    sharedType: "song",
    sharedName: "Sunflower",
    artist: "Post Malone, Swae Lee",
    time: "5 giờ trước",
  },
  {
    id: "s2",
    name: "Nguyễn Văn A", // Đổi từ receiver thành name
    avatarColor: "bg-blue-500",
    sharedType: "video",
    sharedName: "Live at Wembley",
    artist: "The Weeknd",
    time: "4 ngày trước",
  },
];

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  // Biến đại diện lấy data theo Tab
  const currentMessages =
    activeTab === "received" ? mockReceivedMessages : mockSentMessages;
  const isSentTab = activeTab === "sent";

  // Phân trang đơn giản
  const [currentPage, setCurrentPage] = useState<number>(1); // Trang hiện tại
  const itemsPerPage = 3; // Số lượng item muốn hiện trên 1 trang (ví dụ là 2)

  // Tính toán các item cần hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentMessages.slice(indexOfFirstItem, indexOfLastItem);

  // Tính tổng số trang
  const totalPages = Math.ceil(currentMessages.length / itemsPerPage);

  // Hàm chuyển tab (đồng thời reset về trang 1)
  const handleTabChange = (tab: "received" | "sent") => {
    setActiveTab(tab);
    setCurrentPage(1);
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
          onClick={() => handleTabChange("received")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            !isSentTab
              ? "bg-green-500 text-black"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          <Inbox className="size-4" />
          Đã chia sẻ với tôi
        </button>

        <button
          onClick={() => handleTabChange("sent")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            isSentTab
              ? "bg-green-500 text-black"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          <Send className="size-4" />
          Đã gửi cho người khác
        </button>
      </div>
      {/* Danh sách hiển thị - Sạch sẽ, không còn hàm lồng phức tạp */}
      <div className="space-y-3">
        {currentMessages.length > 0 ? (
          currentItems.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl transition-all border ${
                isSentTab
                  ? "bg-zinc-900/20 border-zinc-800/30 hover:bg-zinc-800/20"
                  : "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40"
              }`}
            >
              <div className="flex gap-4 items-start w-full">
                {/* Avatar tròn */}
                <div
                  className={`size-10 rounded-full flex items-center justify-center text-black font-bold shrink-0 ${item.avatarColor} ${isSentTab && "opacity-80"}`}
                >
                  {item.name.charAt(0)}
                </div>

                {/* Khung thông tin chữ */}
                <div className="space-y-1 w-full">
                  <div className="flex items-center gap-2">
                    {isSentTab ? (
                      <>
                        <span className="text-xs text-zinc-400">
                          Bạn đã gửi cho
                        </span>
                        <span className="font-semibold text-white text-sm">
                          {item.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-white text-sm">
                          {item.name}
                        </span>
                        <span className="text-xs text-zinc-400">
                          đã gửi cho bạn
                        </span>
                      </>
                    )}
                    <span className="text-xs text-zinc-500">• {item.time}</span>
                  </div>

                  {/* Khung Hộp Nhạc đính kèm */}
                  {item.sharedType !== "text" && (
                    <div className="mt-2 flex items-center gap-3 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800 max-w-sm group/item hover:border-zinc-700 transition-colors">
                      <div className="size-10 bg-zinc-800 rounded flex items-center justify-center text-zinc-400 shrink-0 relative">
                        <Music2 className="size-5 group-hover/item:opacity-0 transition-opacity" />
                        <Play className="size-4 fill-white text-white absolute opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-white truncate">
                          {item.sharedName}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {item.sharedType === "song"
                            ? `Bài hát · ${item.artist}`
                            : item.sharedType === "video"
                              ? `Video · ${item.artist}`
                              : "Playlist"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/10 rounded-xl border border-dashed border-zinc-800">
            {isSentTab ? (
              <Send className="mb-3 size-10 text-zinc-600" />
            ) : (
              <Mail className="mb-3 size-10 text-zinc-600" />
            )}
            <p className="text-sm text-zinc-400">
              {isSentTab
                ? "Bạn chưa gửi nội dung nào cho bạn bè."
                : "Không có nội dung nào được chia sẻ với bạn."}
            </p>
          </div>
        )}
      </div>

      {/* Phân trang đơn giản - chỉ hiển thị khi có nhiều hơn 1 trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-400">
            Đang hiện trang{" "}
            <span className="text-white font-medium">{currentPage}</span> trên
            tổng số <span className="text-white font-medium">{totalPages}</span>{" "}
            trang
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-8 rounded border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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
