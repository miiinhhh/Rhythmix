import { useState, useEffect } from "react";
import {
  Play,
  Clock,
  Heart,
  Pause,
  Share2,
  Trash2,
  Plus,
  Pencil,
  Globe,
  Lock,
  GripVertical,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import AddSongModal from "../components/AddSongModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import UpdatePlaylistModal from "../components/UpdatePlaylistModal";
import { musicService } from "../services/musicService";
import ShareModal from "../components/ShareModal";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

interface SongType {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
}

interface OutletContextType {
  currentSongId: number | null;
  setCurrentSongId: (id: number | null) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  songs: SongType[];
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
  onShareSuccess: (type: "song" | "video" | "playlist", itemInfo: any, receiverName: string) => void;
}

const MOCK_ALL_SONGS: SongType[] = [
  {
    id: 1,
    title: "Sunset Boulevard",
    artist: "Neon Coast",
    album: "City Lights",
    duration: "0:41",
    isLiked: true,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "Velvet Sky",
    artist: "Aria Lane",
    album: "Nightfall",
    duration: "0:45",
    isLiked: false,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "Paper Planes",
    artist: "The Drifters",
    album: "Horizons",
    duration: "0:50",
    isLiked: false,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: 4,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    isLiked: false,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: 5,
    title: "Starboy",
    artist: "The Weeknd",
    album: "Starboy",
    duration: "3:50",
    isLiked: false,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
];

const PlaylistDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const foundPlaylist = musicService.getPlaylistById(id || "");
  // 1. Tìm kiếm playlist tương ứng từ Mock Data dựa vào URL ID
  // const foundPlaylist = MOCK_PLAYLISTS.find((p) => p.id === id);

  // 2. KHAI BÁO TẤT CẢ CÁC HOOKS LÊN TRÊN ĐẦU (Không được đặt sau câu lệnh return sớm)
  const [playlistInfo, setPlaylistInfo] = useState(foundPlaylist);
  const [playlistSongs, setPlaylistSongs] = useState<SongType[]>(
    foundPlaylist ? foundPlaylist.songs : [],
  );

  const {
    currentSongId,
    setCurrentSongId,
    isPlaying,
    setIsPlaying,
    setSongs: setLibrarySongs,
    onShareSuccess,
  } = useOutletContext<OutletContextType>();

  const [likedPulse, setLikedPulse] = useState<number[]>([]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isUpdatePlaylistModalOpen, setIsUpdatePlaylistModalOpen] =
    useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(playlistSongs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPlaylistSongs(items);
  };
  // State bổ sung để quản lý bài hát đang được click chọn (active hàng) theo chuẩn UX Spotify
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // Cập nhật lại dữ liệu khi URL ID thay đổi (User chuyển đổi giữa các playlist)
  useEffect(() => {
    if (foundPlaylist) {
      setPlaylistInfo(foundPlaylist);
      setPlaylistSongs(foundPlaylist.songs || []);
    }
  }, [id, foundPlaylist]);

  // 3. KIỂM TRA ĐIỀU KIỆN RETURN SỚM TẠI ĐÂY (Sau khi các Hook đã khởi tạo xong)
  if (!playlistInfo) {
    return (
      <div className="p-6 text-center text-zinc-400 grow bg-zinc-900 min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Playlist không tồn tại
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-green-500 hover:underline font-semibold mt-2"
        >
          Quay lại trang trước
        </button>
      </div>
    );
  }

  const handlePlaySong = (songId: number) => {
    const song = playlistSongs.find((s) => s.id === songId);
    if (song) musicService.addRecentSong(song);

    if (currentSongId === songId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSongId(songId);
      setIsPlaying(true);
    }
  };

  // Hàm xử lý nút Play lớn ở Header
  const handleTogglePlaylist = () => {
    if (!currentSongId && playlistSongs.length > 0) {
      setCurrentSongId(playlistSongs[0].id);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };
  const handleDeleteConfirm = () => {
    if (selectedSong && id) {
      musicService.deleteSongFromPlaylist(id, selectedSong.id);
      setPlaylistSongs((prev) => prev.filter((song) => song.id !== selectedSong.id));
      if (selectedSong.id === currentSongId) {
        setCurrentSongId(null);
        setIsPlaying(false);
      }
      setIsDeleteOpen(false);
      setSelectedSong(null);
    }
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="grow bg-zinc-900 text-white p-6 min-h-screen">
      {/* NÚT BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center bg-zinc-800 text-sm font-bold text-white py-2 px-4 rounded-full mb-6 hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
      >
        <ArrowLeft className="mr-1.5 size-4" /> Back
      </button>

      {/* Header Info */}
      <div className="flex items-end gap-6 mb-8">
        <div className="w-44 h-44 shrink-0 bg-linear-to-br from-green-700 to-zinc-800 rounded-lg flex items-center justify-center shadow-2xl">
          <span className="text-6xl text-zinc-400">🎵</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-300">
            Playlist
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight">
              {playlistInfo.title}
            </h1>
            <div
              className="mt-3 text-zinc-400"
              title={
                playlistInfo.isPublic
                  ? "Danh sách phát Công khai"
                  : "Danh sách phát Riêng tư"
              }
            >
              {playlistInfo.isPublic ? (
                <Globe size={24} className="text-green-500" />
              ) : (
                <Lock size={24} className="text-zinc-400" />
              )}
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {playlistInfo.description}
          </p>
          <p className="text-xs text-zinc-300 mt-2 font-medium">
            <span className="text-white font-bold">Soundwave</span> •{" "}
            {playlistSongs.length} songs, about 12 min
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between w-full mb-8">
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
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
            title="Chia sẻ playlist"
          >
            <Share2 size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddSongModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 px-4 py-2 text-sm font-semibold transition-all cursor-pointer active:scale-95"
          >
            <Plus className="size-4 stroke-[3px]" /> Add New Song
          </button>
          <button
            type="button"
            onClick={() => setIsUpdatePlaylistModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 px-4 py-2 text-sm font-semibold transition-all cursor-pointer active:scale-95"
          >
            <Pencil className="size-4 stroke-[3px]" /> Update Playlist
          </button>
        </div>
      </div>

      {/* BẢNG DANH SÁCH BÀI HÁT */}
      <div className="w-full">
        {/* Header bảng (Giữ nguyên của ông) */}
        <div className="grid grid-cols-[40px_1fr_1fr_140px] gap-x-5 items-center text-zinc-400 text-xs uppercase font-bold tracking-wider px-4 py-2 border-b border-zinc-800 mb-3">
          <div className="text-center">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="flex justify-end pr-22">
            <Clock size={16} />
          </div>
        </div>

        {/* VÒNG LẶP DANH SÁCH BÀI HÁT TÍCH HỢP KÉO THẢ */}
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="songs-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1" // Giúp khoảng cách các hàng đều nhau
              >
                {playlistSongs.map((song, index) => {
                  const isCurrent = song.id === currentSongId;
                  const isSelectedRow = song.id === selectedRowId;

                  return (
                    <Draggable
                      key={song.id.toString()}
                      draggableId={song.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          onClick={() => setSelectedRowId(song.id)}
                          onDoubleClick={() => handlePlaySong(song.id)}
                          //  Nếu đang bị kéo thì thêm border hoặc đổi màu nền cho nổi bật
                          className={`grid grid-cols-[40px_1fr_1fr_140px] gap-x-5 items-center px-4 py-3 rounded-md cursor-pointer group transition-colors select-none ${
                            isSelectedRow || snapshot.isDragging
                              ? "bg-zinc-800/80"
                              : "hover:bg-zinc-800/40"
                          } ${snapshot.isDragging ? "shadow-2xl border border-zinc-700 bg-zinc-800" : ""}`}
                        >
                          {/* CỘT # XỬ LÝ LOGIC + ICON GRIP ĐỂ KÉO */}
                          <div className="text-zinc-400 font-medium text-center flex items-center justify-center min-w-6 min-h-6 relative">
                            {/* Khi hover vào dòng, hiện nút Play/Pause HOẶC hiện nút 6 chấm để nắm kéo thả */}
                            <div className="hidden group-hover:flex items-center gap-1">
                              {/* Icon nắm kéo thả (Chỉ xuất hiện khi hover) */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-white p-1"
                              >
                                <GripVertical size={14} />
                              </div>

                              {isCurrent && isPlaying ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPlaying(false);
                                  }}
                                  className="text-white"
                                >
                                  <Pause fill="white" size={12} />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlaySong(song.id);
                                  }}
                                  className="text-white hover:scale-110 transition-transform"
                                >
                                  <Play fill="white" size={12} />
                                </button>
                              )}
                            </div>

                            {/* TRẠNG THÁI BÌNH THƯỜNG (KHI KHÔNG HOVER) */}
                            <div className="group-hover:hidden">
                              {isCurrent ? (
                                isPlaying ? (
                                  <div className="flex items-end justify-center gap-0.75 h-3.5 w-5 mx-auto">
                                    <span className="w-0.75 bg-green-500 rounded-full animate-[bounce_0.8s_infinite_100ms] h-2"></span>
                                    <span className="w-0.75 bg-green-500 rounded-full animate-[bounce_0.8s_infinite_300ms] h-3.5"></span>
                                    <span className="w-0.75 bg-green-500 rounded-full animate-[bounce_0.8s_infinite_0s] h-1.5"></span>
                                    <span className="w-0.75 bg-green-500 rounded-full animate-[bounce_0.8s_infinite_200ms] h-2.5"></span>
                                  </div>
                                ) : (
                                  <div className="flex items-end justify-center gap-0.75 h-3.5 w-5 mx-auto">
                                    <span className="w-0.75 h-2 bg-green-500 rounded-full"></span>
                                    <span className="w-0.75 h-3.5 bg-green-500 rounded-full"></span>
                                    <span className="w-0.75 h-1.5 bg-green-500 rounded-full"></span>
                                    <span className="w-0.75 h-2.5 bg-green-500 rounded-full"></span>
                                  </div>
                                )
                              ) : (
                                <span
                                  className={
                                    isSelectedRow
                                      ? "text-green-500 font-semibold"
                                      : "text-zinc-400"
                                  }
                                >
                                  {index + 1}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tên bài + Ca sĩ (Giữ nguyên) */}
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

                          {/* Tên Album (Giữ nguyên) */}
                          <div className="text-sm text-zinc-400 truncate pr-4 group-hover:text-zinc-300">
                            {song.album}
                          </div>

                          {/* Thời gian + Trái tim + Delete (Giữ nguyên) */}
                          <div className="flex items-center justify-end text-sm text-zinc-400 pr-2">
                            <div className="flex items-center justify-between gap-x-4 min-w-35">
                              <span className="font-medium text-right flex-1">
                                {song.duration}
                              </span>

                              <div className="w-5 flex justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    musicService.toggleSongLike(song.id);
                                    setPlaylistSongs((prev) =>
                                      prev.map((s) =>
                                        s.id === song.id
                                          ? { ...s, isLiked: !s.isLiked }
                                          : s,
                                      ),
                                    );
                                    setLibrarySongs((prev) =>
                                      prev.map((s) =>
                                        s.id === song.id
                                          ? { ...s, isLiked: !s.isLiked }
                                          : s,
                                      ),
                                    );
                                    setLikedPulse((prev) => [...prev, song.id]);
                                    setTimeout(() => {
                                      setLikedPulse((prev) =>
                                        prev.filter((id) => id !== song.id),
                                      );
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

                              <div className="w-5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSong({
                                      id: song.id,
                                      title: song.title,
                                    });
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
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* MODALS */}
      <AddSongModal
        isOpen={isAddSongModalOpen}
        onClose={() => setIsAddSongModalOpen(false)}
        allSongs={MOCK_ALL_SONGS}
        currentPlaylistSongs={playlistSongs}
        onAddSongSuccess={(newSong) => {
          setPlaylistSongs((prevSongs) => [...prevSongs, newSong]);
          setLibrarySongs((prevSongs) =>
            prevSongs.some((song) => song.id === newSong.id)
              ? prevSongs.map((song) =>
                  song.id === newSong.id ? { ...song, ...newSong } : song,
                )
              : [...prevSongs, newSong],
          );
        }}
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
        playlistData={playlistInfo}
        onUpdateSuccess={(updatedData) => {
          const updated = musicService.updatePlaylist(playlistInfo.id, updatedData);
          if (updated) {
            setPlaylistInfo(updated);
          }
        }}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemToShare={{
          type: "playlist",
          // playlistInfo luôn có id (chuỗi string chuẩn từ musicService)
          id: playlistInfo.id, 
          // Lấy tiêu đề thực tế của Playlist (ví dụ: "Daily Mix 1")
          title: playlistInfo.title, 
          // Hiển thị thông tin mô tả phụ (ví dụ: "Playlist • 3 songs")
          subtitle: `Playlist • ${playlistSongs.length} bài hát`, 
        }}
        // 🟢 LIÊN KẾT MA THUẬT: Khi bấm nút Gửi trong Modal, nó sẽ kích hoạt hàm này
        onShareSuccess={(receiverName: string) => {
          if (typeof onShareSuccess === "function") {
            onShareSuccess(
              "playlist", // Định dạng loại đồ chơi là playlist
              {
                id: playlistInfo.id,
                title: playlistInfo.title,
                // Nếu playlist có ảnh bìa thì truyền vào đây, không thì để chuỗi rỗng hoặc icon mặc định
                coverUrl: "", 
                description: playlistInfo.description
              },
              receiverName // Tên người nhận được chọn từ modal
            );
          }
        }}
      />
    </div>
  );
};

export default PlaylistDetailPage;
