import { useState } from "react";
import { Library, Music2, ListMusic, Play, Plus } from "lucide-react"; // Thêm ListMusic và Plus để làm nút Upload/Create
import UploadMediaModal from "../components/UploadMediaModal"
import { useNavigate } from "react-router-dom";
import CreatePlaylistModal from "../components/CreatePlaylistModal";

// 1. Dữ liệu giả lập chuẩn hóa theo Database (chia rõ loại playlists và albums)
const libraryItems = [
  {
    title: "Liked Songs",
    subtitle: "Playlist · 248 songs",
    type: "playlists" as const,
  },
  {
    title: "Summer 2026",
    subtitle: "Playlist · 64 songs",
    type: "playlists" as const,
  },
  {
    title: "Deep Focus",
    subtitle: "Playlist · 120 songs",
    type: "playlists" as const,
  },
  {
    title: "Road Trip",
    subtitle: "Playlist · 88 songs",
    type: "playlists" as const,
  },

  // Nhóm Albums (Do chính User/Nghệ sĩ này upload lên hệ thống - bảng Albums)
  {
    title: "After Hours",
    subtitle: "Album · The Weeknd",
    type: "albums" as const,
  },
  {
    title: "Lost in Saigon",
    subtitle: "Album · Tự xuất bản",
    type: "albums" as const,
  },
];

// 2. Định nghĩa lại các Tab: All, Playlists, Albums
const libraryTabs = [
  { id: "all" as const, label: "All", icon: Library },
  { id: "playlists" as const, label: "Playlists", icon: ListMusic },
  { id: "albums" as const, label: "Albums", icon: Music2 },
];

const LibraryPage = () => {

  const navigate = useNavigate();
  // Cập nhật lại kiểu dữ liệu của State activeTab cho khớp với id mới
  const [activeTab, setActiveTab] = useState<"all" | "playlists" | "albums">("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  // Logic lọc dữ liệu dựa trên Tab đang chọn
  const filtered =
    activeTab === "all"
      ? libraryItems
      : libraryItems.filter((item) => item.type === activeTab);

  return (
    <div className="space-y-6 select-none">
      {/* Tiêu đề trang + Nút Upload hành động */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white">
            Your Library
          </h1>
          <p className="mt-1 text-pretty text-sm text-zinc-400">
            All your saved music, playlists, and published albums in one place.
          </p>
        </div>
      </div>

      {/* Thanh bấm chuyển đổi các Tab (All / Playlists / Albums) và cụm nút hành động */}
      <div className="flex items-center justify-between">
        
        {/* Cụm bên trái: Các Tab bộ lọc (Giữ nguyên của bạn) */}
        <div className="flex gap-2">
          {libraryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-green-500 text-black"
                    : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 🌟 CỤM BÊN PHẢI: Bọc 2 nút Upload và Create vào đây để tụi nó đứng sát nhau */}
        <div className="flex items-center gap-3">
          
          {/* Nút Upload Music */}
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 cursor-pointer active:scale-95"
          >
            <Plus className="size-4 stroke-3" />
            Upload Music in Album
          </button>
          
          {/* Nút Create New Playlist */}
          <button
            type="button"
            onClick={() => setIsCreatePlaylistOpen(true)}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 cursor-pointer active:scale-95"
          >
            <Plus className="size-4 stroke-3" />
            Create New Playlist
          </button>

        </div>

      </div>

      {/* Lưới hiển thị danh sách các mục trong thư viện */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((item) => (
          <article
            key={item.title}
            onClick={() => navigate("/playlist")}
            className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800"
          >
            <div className="relative mb-3">
              {/* Nếu là mục "Liked Songs" thì bo tròn hình tròn, còn lại (Playlist/Album) bo góc vuông */}
              <div
                className={`flex aspect-square w-full items-center justify-center bg-zinc-800 shadow-lg ${
                  item.title === "Liked Songs" ? "rounded-full" : "rounded-md"
                }`}
              >
                {/* Thay đổi icon hiển thị dựa trên loại dữ liệu */}
                {item.type === "albums" ? (
                  <Music2 className="size-10 text-zinc-400" />
                ) : (
                  <ListMusic className="size-10 text-zinc-400" />
                )}
              </div>

              {/* Nút Play màu xanh lá hiện lên khi hover */}
              <button
                type="button"
                className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
              >
                <Play className="size-5 fill-black text-black" />
              </button>
            </div>
            <h3 className="truncate text-sm font-semibold text-white">
              {item.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
              {item.subtitle}
            </p>
          </article>
        ))}
      </div>

      {/* Hiển thị thông báo này nếu mảng sau khi lọc bị trống */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-20 text-center">
          <ListMusic className="mb-3 size-8 text-zinc-500" />
          <p className="text-sm text-zinc-400">Nothing here yet.</p>
        </div>
      )}
      <UploadMediaModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />
    </div>
  );
};

export default LibraryPage;
