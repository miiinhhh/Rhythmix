import { useEffect, useState } from "react";
import { Library, Music2, ListMusic, Play, Plus, Heart, Trash2, Check, X, LoaderCircle } from "lucide-react";
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  // Logic lọc dữ liệu dựa trên Tab đang chọn
  const { setCurrentSongId, setIsPlaying, songs, setSongs } =
    useOutletContext<OutletContextType>();
  const [myMedia, setMyMedia] = useState<SongType[]>([]);
  const [deletableMedia, setDeletableMedia] = useState<SongType[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [, setFavoriteIds] = useState<string[]>([]);

  const loadMyMedia = async () => {
    const mediaItems = await mediaService.getMyMedia();
    // Filter out media that's already in an album
    const singleMediaItems = mediaItems.filter(item => !item.albumId);
    const mappedSongs = singleMediaItems.map(mapMediaToSong);
    setDeletableMedia(
      mediaItems.map(mapMediaToSong).filter((song) => song.mediaType === "audio"),
    );
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

  useEffect(() => {
    if (!deleteSuccess) return;

    const timeoutId = window.setTimeout(() => setDeleteSuccess(""), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [deleteSuccess]);

  const visibleMedia =
    activeTab === "playlists" || activeTab === "albums" ? [] : myMedia;
  const visiblePlaylists = activeTab === "albums" ? [] : playlists;
  const visibleAlbums = activeTab === "playlists" ? [] : albums;
  const likedCount = songs.filter((song) => song.isLiked).length;

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMediaIds((previous) =>
      previous.includes(mediaId)
        ? previous.filter((id) => id !== mediaId)
        : [...previous, mediaId],
    );
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setSelectedMediaIds([]);
    setDeleteError("");
  };

  const deleteSelectedMedia = async () => {
    if (selectedMediaIds.length === 0 || isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");

    const results = await Promise.allSettled(
      selectedMediaIds.map((mediaId) => mediaService.deleteMedia(mediaId)),
    );
    const deletedIds = selectedMediaIds.filter(
      (_, index) => results[index].status === "fulfilled",
    );
    const failedCount = selectedMediaIds.length - deletedIds.length;

    if (deletedIds.length > 0) {
      const deletedIdSet = new Set(deletedIds);
      setMyMedia((previous) => previous.filter((song) => !deletedIdSet.has(song.id)));
      setDeletableMedia((previous) => previous.filter((song) => !deletedIdSet.has(song.id)));
      setSongs((previous) => previous.filter((song) => !deletedIdSet.has(song.id)));
      await loadAlbums().catch(() => setAlbums([]));
    }

    setIsDeleting(false);

    if (failedCount > 0) {
      setSelectedMediaIds(selectedMediaIds.filter((id) => !deletedIds.includes(id)));
      setDeleteError(`${failedCount} bài hát không thể xóa. Vui lòng thử lại.`);
      return;
    }

    setIsDeleteModalOpen(false);
    setSelectedMediaIds([]);
    setDeleteSuccess(
      deletedIds.length === 1
        ? "Đã xóa bài hát thành công."
        : `Đã xóa thành công ${deletedIds.length} bài hát.`,
    );
  };

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
          <button
            type="button"
            onClick={() => {
              setSelectedMediaIds([]);
              setDeleteError("");
              setIsDeleteModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full border border-red-500/70 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500 hover:text-white cursor-pointer"
          >
            <Trash2 className="size-4" />
            Delete audio
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
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[80vh] w-full max-w-xl flex-col rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">Xóa audio</h2>
                <p className="mt-1 text-sm text-zinc-400">Chọn các bài hát bạn muốn xóa vĩnh viễn.</p>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed"
                aria-label="Đóng"
                title="Đóng"
              >
                <X className="size-5" />
              </button>
            </div>

            {deleteError && (
              <p className="mx-5 mt-4 rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                {deleteError}
              </p>
            )}

            <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-5">
              {deletableMedia.length > 0 ? (
                deletableMedia.map((item) => {
                  const isSelected = selectedMediaIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleMediaSelection(item.id)}
                      disabled={isDeleting}
                      className={`flex w-full items-center gap-3 rounded-md border p-2 text-left transition disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-green-500 bg-green-500/10"
                          : "border-zinc-800 hover:bg-zinc-800"
                      }`}
                    >
                      {item.posterUrl ? (
                        <img src={item.posterUrl} alt="" className="size-12 rounded object-cover" />
                      ) : (
                        <div className="flex size-12 items-center justify-center rounded bg-zinc-800">
                          <Music2 className="size-5 text-zinc-400" />
                        </div>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                        <span className="block truncate text-xs text-zinc-400">{item.artist}</span>
                      </span>
                      <span className={`flex size-6 shrink-0 items-center justify-center rounded border ${
                        isSelected ? "border-green-500 bg-green-500 text-black" : "border-zinc-600"
                      }`}>
                        {isSelected && <Check className="size-4 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="py-10 text-center text-sm text-zinc-500">Bạn chưa có audio nào để xóa.</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 p-5">
              <span className="text-sm text-zinc-400">Đã chọn {selectedMediaIds.length} bài hát</span>
              <button
                type="button"
                onClick={() => void deleteSelectedMedia()}
                disabled={selectedMediaIds.length === 0 || isDeleting}
                className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting && <LoaderCircle className="size-4 animate-spin" />}
                Xóa đã chọn
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteSuccess && (
        <div className="fixed bottom-24 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black shadow-lg">
          {deleteSuccess}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
