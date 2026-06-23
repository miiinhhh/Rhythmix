import { useEffect, useState } from "react";
import { Library, Music2, ListMusic, Play, Plus, Heart } from "lucide-react"; // Thêm ListMusic và Plus để làm nút Upload/Create
import UploadMediaModal from "../components/UploadMediaModal";
import { useNavigate, useOutletContext } from "react-router-dom";
import CreatePlaylistModal from "../components/CreatePlaylistModal";
import { albumService } from "../api/albumService";
import { mediaService } from "../api/mediaService";
import { playlistService } from "../api/playlistService";
import { mapMediaToSong, type SongType } from "../utils/mediaMapping";
import { userService } from "../api/userService";
import type { AlbumDto, PlaylistDto } from "../types/api";
import { API_BASE_URL } from "../config/apiConfig";

interface OutletContextType {
  setCurrentSongId: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  songs: SongType[];
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
}

// 2. Định nghĩa lại các Tab: All, Playlists, Albums
const libraryTabs = [
  { id: "all" as const, label: "All", icon: Library },
  { id: "playlists" as const, label: "Playlists", icon: ListMusic },
  { id: "albums" as const, label: "Albums", icon: Music2 },
];

const LibraryPage = () => {
  const navigate = useNavigate();
  // Cập nhật lại kiểu dữ liệu của State activeTab cho khớp với id mới
  const [activeTab, setActiveTab] = useState<"all" | "playlists" | "albums">(
    "all",
  );
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  // Logic lọc dữ liệu dựa trên Tab đang chọn
  const { setCurrentSongId, setIsPlaying, songs, setSongs } =
    useOutletContext<OutletContextType>();
  const [myMedia, setMyMedia] = useState<SongType[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [, setFavoriteIds] = useState<string[]>([]);

  const loadMyMedia = async () => {
    const mediaItems = await mediaService.getMyMedia();
    // Filter out media that's already in an album
    const singleMediaItems = mediaItems.filter(item => !item.albumId);
    const mappedSongs = singleMediaItems.map(mapMediaToSong);
    setMyMedia(mappedSongs);
    setSongs((prev) => {
      const existingIds = new Set(prev.map((song) => song.id));
      return [
        ...prev,
        ...mappedSongs.filter((song) => !existingIds.has(song.id)),
      ];
    });
  };

  const loadPlaylists = async () => {
    const items = await playlistService.getAll();
    setPlaylists(items);
  };

  const loadAlbums = async () => {
    const items = await albumService.getMyAlbums();
    setAlbums(items);
  };

  const loadFavoriteIds = async () => {
    const favorites = await userService.getFavorites();

    console.log("LIBRARY FAVORITES:", favorites);

    const ids = favorites
      .map((item: any) => String(item))
      .filter((id: string) => id !== "");

    setFavoriteIds(ids);

    setSongs((prev) =>
      prev.map((song) => ({
        ...song,
        isLiked: ids.includes(String(song.id)),
      }))
    );
  };

  useEffect(() => {
    loadMyMedia().catch(() => setMyMedia([]));
    loadPlaylists().catch(() => setPlaylists([]));
    loadAlbums().catch(() => setAlbums([]));
    loadFavoriteIds().catch(() => setFavoriteIds([]));
  }, []);

  const visibleMedia =
    activeTab === "playlists" || activeTab === "albums" ? [] : myMedia;
  const visiblePlaylists = activeTab === "albums" ? [] : playlists;
  const visibleAlbums = activeTab === "playlists" ? [] : albums;
  const likedCount = songs.filter((song) => song.isLiked).length;

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
        {/* 🔥 TỰ HIỂN THỊ CARD TRÒN LIKED SONGS (Chỉ hiện ở tab All hoặc Playlists) */}
        {(activeTab === "all" || activeTab === "playlists") && (
          <article
            onClick={() => navigate("/liked")} // Nhấn vào là qua trang LikedSongsPage liền
            className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800"
          >
            <div className="relative mb-3">
              {/* Ép cố định giao diện hình tròn chuẩn Spotify */}
              <div className="flex aspect-square w-full items-center justify-center bg-zinc-800 shadow-lg rounded-full">
                <Heart className="size-10 text-green-500 fill-green-500" />
              </div>
              <button
                type="button"
                className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
              >
                <Play className="size-5 fill-black text-black" />
              </button>
            </div>
            <h3 className="truncate text-sm font-semibold text-white">
              Liked Songs
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
              Playlist · {likedCount} songs
            </p>
          </article>
        )}
        {visiblePlaylists.map((playlist) => (
          <article
            key={playlist.playlistId}
            onClick={() =>
              navigate(`/playlist/${playlist.playlistId}`, {
                state: { thumbnail: playlist.thumbnailUrl },
              })
            }
            className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800"
          >
            <div className="relative mb-3">
              {playlist.thumbnailUrl ? (
                <img
                  src={playlist.thumbnailUrl.startsWith("http") ? playlist.thumbnailUrl : `${API_BASE_URL}${playlist.thumbnailUrl}`}
                  alt={playlist.name}
                  className="aspect-square w-full rounded-md object-cover shadow-lg"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                  <ListMusic className="size-10 text-zinc-400" />
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
              >
                <Play className="size-5 fill-black text-black" />
              </button>
            </div>
            <h3 className="truncate text-sm font-semibold text-white">
              {playlist.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
              Playlist · {playlist.trackCount ?? 0} songs · {" "}
              {playlist.isPublic ? "Public" : "Private"}
            </p>
          </article>
        ))}
        {visibleAlbums.map((album) => (
          <article
            key={album.albumId}
            onClick={() => navigate(`/album/${album.albumId}`)}
            className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800"
          >
            <div className="relative mb-3">
              {album.coverImageUrl ? (
                <img
                  src={album.coverImageUrl.startsWith("http") ? album.coverImageUrl : `${API_BASE_URL}${album.coverImageUrl}`}
                  alt={album.title}
                  className="aspect-square w-full rounded-md object-cover shadow-lg"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                  <Music2 className="size-10 text-zinc-400" />
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
              >
                <Play className="size-5 fill-black text-black" />
              </button>
            </div>
            <h3 className="truncate text-sm font-semibold text-white">
              {album.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
              Album · {album.trackCount} songs
            </p>
          </article>
        ))}
        {visibleMedia.map((item) => (
          <article
            key={item.id}
            onClick={() => {
              setCurrentSongId(item.id);
              setIsPlaying(true);
            }}
            className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800"
          >
            <div className="relative mb-3">
              {/* Nếu là mục "Liked Songs" thì bo tròn hình tròn, còn lại (Playlist/Album) bo góc vuông */}
              {item.posterUrl ? (
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="aspect-square w-full rounded-md object-cover shadow-lg"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                  <Music2 className="size-10 text-zinc-400" />
                </div>
              )}

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
              {item.artist} · {item.mediaType}
            </p>
          </article>
        ))}
      </div>

      {/* Hiển thị thông báo này nếu mảng sau khi lọc bị trống */}
      {visibleMedia.length === 0 &&
        visiblePlaylists.length === 0 &&
        visibleAlbums.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-20 text-center">
            <ListMusic className="mb-3 size-8 text-zinc-500" />
            <p className="text-sm text-zinc-400">Nothing here yet.</p>
          </div>
        )}
      <UploadMediaModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={async () => {
          await loadMyMedia();
          await loadAlbums();
        }}
      />
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onPlaylistCreated={loadPlaylists}
      />
    </div>
  );
};

export default LibraryPage;
