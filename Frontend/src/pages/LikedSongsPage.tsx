import { useState, useEffect } from "react";
import { Heart, Play, Pause, Music2, Clock, ArrowLeft, GripVertical } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { musicService } from "../services/musicService";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

interface SongType {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
}
// 1. Nhận hàm đổi bài hát từ Props truyền xuống (Ví dụ đặt tên là onPlayTrack)
// 1. Định nghĩa chuẩn các thuộc tính nhận từ Outlet của AppLayout
interface OutletContextType {
  currentSongId: number | null;
  setCurrentSongId: (id: number | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  songs: SongType[];
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
}

const LikedSongsPage = () => {
 const navigate = useNavigate();
    
  const { currentSongId, setCurrentSongId, isPlaying, setIsPlaying, setSongs } = useOutletContext<OutletContextType>();
  const [likedSongs, setLikedSongs] = useState<SongType[]>(musicService.getLikedSongs());
//   const [currentSongId, setCurrentSongId] = useState<number | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [likedPulse, setLikedPulse] = useState<number[]>([]);

  const refreshLikedSongs = () => {
    setLikedSongs([...musicService.getLikedSongs()]);
  };

  // Hàm xử lý sau khi kéo thả xong để cập nhật lại vị trí trong State
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(likedSongs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLikedSongs(items);
    
    // Nếu musicService của ông có hàm lưu lại thứ tự, ông có thể gọi ở đây
    musicService.saveLikedSongsOrder(items);
    };
    
  const handlePlaySong = (songId: number) => {
    const song = likedSongs.find((s) => s.id === songId);
    if (!song) return;

    musicService.addRecentSong(song);

    // 🔥 ĐỒNG BỘ QUA CONTEXT: 
    // Thay vì gọi hàm onPlayTrack không tồn tại, ông đổi giá trị currentSongId của AppLayout
    if (currentSongId === songId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSongId(songId); // Kích hoạt PlayerBar cập nhật bài mới
      setIsPlaying(true);
    }
  };
  const handleUnlike = (songId: number) => {
    musicService.toggleSongLike(songId);
    setLikedPulse((prev) => [...prev, songId]);
      
    setSongs((prev) => 
      prev.map((s) => s.id === songId ? { ...s, isLiked: false } : s)
    );
    
    setTimeout(() => {
      setLikedPulse((prev) => prev.filter((id) => id !== songId));
      refreshLikedSongs();
    }, 220);

    if (currentSongId === songId) {
      setCurrentSongId(null);
      setIsPlaying(false);
    }
  };

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
        <div className="w-44 h-44 shrink-0 bg-gradient-to-br from-pink-500 to-green-500 rounded-full flex items-center justify-center shadow-2xl">
          <Heart className="size-16 fill-black text-black" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-300">
            Library Collection
          </span>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight mt-1">
            Liked Songs
          </h1>
          <p className="text-xs text-zinc-300 mt-2 font-medium">
            <span className="text-white font-bold">Soundwave</span> • {likedSongs.length} songs
          </p>
        </div>
      </div>

      {/* BẢNG DANH SÁCH BÀI HÁT */}
      <div className="w-full">
        {/* Header bảng */}
        <div className="grid grid-cols-[40px_1fr_1fr_140px] gap-x-5 items-center text-zinc-400 text-xs uppercase font-bold tracking-wider px-4 py-2 border-b border-zinc-800 mb-3">
          <div className="text-center">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="flex justify-end pr-22">
            <Clock size={16} />
          </div>
        </div>

        {/* Bọc DragDropContext bên ngoài danh sách */}
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="liked-songs-list">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef} 
                className="space-y-1"
              >
                {likedSongs.map((song, index) => {
                  const isCurrent = song.id === currentSongId;
                  const isSelectedRow = song.id === selectedRowId;

                  return (
                    <Draggable key={song.id.toString()} draggableId={song.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          onClick={() => setSelectedRowId(song.id)}
                          onDoubleClick={() => handlePlaySong(song.id)}
                          className={`grid grid-cols-[40px_1fr_1fr_140px] gap-x-5 items-center px-4 py-3 rounded-md cursor-pointer group transition-colors select-none ${
                            isSelectedRow || snapshot.isDragging ? "bg-zinc-800/80" : "hover:bg-zinc-800/40"
                          } ${snapshot.isDragging ? "shadow-2xl border border-zinc-700 bg-zinc-800" : ""}`}
                        >
                          {/* CỘT # XỬ LÝ LOGIC HOVER + ICON GRIP ĐỂ KÉO */}
                          <div className="text-zinc-400 font-medium text-center flex items-center justify-center min-w-6 min-h-6 relative">
                            {/* Khi hover: Hiện icon 6 chấm để nắm kéo + nút Play/Pause */}
                            <div className="hidden group-hover:flex items-center justify-center gap-1">
                              <div 
                                {...provided.dragHandleProps} 
                                className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-white p-0.5"
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

                            {/* Khi bình thường (Không hover): Hiện số thứ tự hoặc sóng nhạc */}
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
                                <span className={isSelectedRow ? "text-green-500 font-semibold" : "text-zinc-400"}>
                                  {index + 1}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tên bài + Ca sĩ */}
                          <div className="min-w-0 pr-4">
                            <p className={`text-sm font-semibold truncate ${isCurrent ? "text-green-500" : "text-white"}`}>
                              {song.title}
                            </p>
                            <p className="text-xs text-zinc-400 truncate mt-0.5 group-hover:text-zinc-300">
                              {song.artist}
                            </p>
                          </div>

                          {/* Tên Album */}
                          <div className="text-sm text-zinc-400 truncate pr-4 group-hover:text-zinc-300">
                            {song.album}
                          </div>

                          {/* Thời gian + Nút Like */}
                          <div className="flex items-center justify-end text-sm text-zinc-400 pr-2">
                            <div className="flex items-center justify-between gap-x-4 min-w-35">
                              <span className="font-medium text-right flex-1">{song.duration}</span>

                              <div className="w-5 flex justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnlike(song.id);
                                  }}
                                  aria-label="Unlike"
                                >
                                  <Heart
                                    size={16}
                                    className={`transform transition-transform duration-200 text-green-500 fill-green-500 ${
                                      likedPulse.includes(song.id) ? "scale-125" : "scale-100"
                                    }`}
                                  />
                                </button>
                              </div>

                              {/* Giữ khoảng trống cuối hàng cho đồng nhất với layout trang Playlist */}
                              <div className="w-5"></div>
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
      
      {likedSongs.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-20 text-center">
          <Music2 className="mb-3 size-10 text-zinc-500" />
          <p className="text-sm text-zinc-400">No liked songs yet.</p>
        </div>
      )}
    </div>
  );
};

export default LikedSongsPage;