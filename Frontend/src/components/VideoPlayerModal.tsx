import { X, Play, Pause, Volume2, SkipBack, SkipForward, Heart, Share2, ListPlus } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import ShareModal from "./ShareModal";
import type { ShareItemDto } from "../types/api";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  posterUrl: string;
  title: string;
  artist?: string;
  mediaId?: string;
  isLiked: boolean;
  onShareSuccess?: (type: "song" | "video", trackInfo: any, receiverName: string, share?: ShareItemDto) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  audioCurrentTime: number; 
  audioDuration: number;    
  onSeekAudio: (time: number) => void; 
  onToggleFavorite: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onAddCurrentToQueue: () => void;
}

const VideoPlayerModal = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  posterUrl, 
  title, 
  artist = "Luna Nova", 
  mediaId,
  isLiked,
  isPlaying, 
  setIsPlaying, 
  volume,
  setVolume,
  audioCurrentTime, 
  audioDuration, 
  onSeekAudio,
  onShareSuccess,
  onToggleFavorite,
  onPrevious,
  onNext,
  onAddCurrentToQueue,
}: VideoPlayerModalProps) => {
  console.log("videoUrl:", videoUrl);
  console.log("posterUrl:", posterUrl);
  console.log("isOpen:", isOpen);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoDuration, setVideoDuration] = useState(0); 

  // Mặc định về chế độ Video để khi click vào Video trong Inbox là thấy liền hình
  const [activeMode, setActiveMode] = useState<"audio" | "video">("video");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showQueueToast, setShowQueueToast] = useState(false);

  const safeVideoUrl = videoUrl?.trim() ? videoUrl.trim() : null;
  const safePosterUrl = posterUrl?.trim() ? posterUrl.trim() : "/default-poster.png";
  
  useEffect(() => {
  if (!isOpen) return;

  setActiveMode("video");
}, [isOpen]);

  useEffect(() => {
  const video = videoRef.current;
  if (!video || !safeVideoUrl) return;

  setVideoDuration(0);
  video.load();
}, [safeVideoUrl]);

useEffect(() => {
  const video = videoRef.current;
  if (!video || !isOpen || !safeVideoUrl) return;

  if (isPlaying) {
    video.play().catch((error) => {
      console.log("Video chưa phát được:", error.message);
    });
  } else {
    video.pause();
  }
}, [isPlaying, isOpen, safeVideoUrl]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    if (videoRef.current) videoRef.current.pause();
    onClose();
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying); 
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration;

    if (!Number.isFinite(duration) || duration <= 0) {
      console.log("Video duration lỗi:", duration);
      return;
    }

    setVideoDuration(duration);
    video.currentTime = audioCurrentTime % duration;
  };
  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video || !isOpen || !safeVideoUrl || !isPlaying) return;

    video.play().catch((error) => {
      console.log("Video chưa phát được:", error.message);
    });
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 🟢 Khi người dùng kéo thanh trượt -> Đồng bộ phát súng tua cho cả Audio và Video cùng lúc
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeekAudio(newTime); // Tua audio ngoài PlayerBar
    
    if (videoRef.current && videoDuration > 0) {
      videoRef.current.currentTime = newTime % videoDuration;
    }
  };

  const handleAddCurrentToQueue = () => {
    onAddCurrentToQueue();
    setShowQueueToast(true);
  };

  useEffect(() => {
    if (!showQueueToast) return;

    const timeoutId = window.setTimeout(() => setShowQueueToast(false), 1000);
    return () => window.clearTimeout(timeoutId);
  }, [showQueueToast]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
      
      {/* 1. THANH ĐỈNH */}
      <div className="flex items-center justify-between w-full z-10">
        <div className="w-10"></div>
        <div className="flex bg-zinc-800/80 p-1 rounded-full border border-zinc-700/50 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveMode("audio")}
            className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
              activeMode === "audio" ? "bg-zinc-200 text-black shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Song
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("video")}
            className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
              activeMode === "video" ? "bg-zinc-200 text-black shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Video
          </button>
        </div>
        <button type="button" onClick={handleCloseModal} className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-2 bg-zinc-900/40 rounded-full backdrop-blur-sm">
          <X className="size-6" />
        </button>
      </div>

      {/* 2. KHU VỰC HIỂN THỊ NỘI DUNG */}
      <div className="flex-1 flex items-center justify-center relative my-4 overflow-hidden rounded-xl bg-zinc-950/40 border border-zinc-900">
        {safeVideoUrl ? (
          <video
            key={safeVideoUrl}
            ref={videoRef}
            controls
            muted
            loop
            playsInline
            poster={safePosterUrl}
            onCanPlay={handleCanPlay}
            onLoadedMetadata={handleLoadedMetadata}
            onError={(e) => {
              const video = e.currentTarget;

              console.log("VIDEO ERROR CODE:", video.error?.code);
              console.log("VIDEO ERROR MESSAGE:", video.error?.message);
              console.log("VIDEO URL:", safeVideoUrl);
            }}
            className={`max-h-[75vh] max-w-full object-contain rounded-lg transition-opacity duration-300 ${
              activeMode === "video"
                ? "opacity-100"
                : "opacity-0 absolute pointer-events-none"
            }`}
            onClick={togglePlay}
          >
            <source src={safeVideoUrl} />
          </video>
        ) : (
          activeMode === "video" && (
            <div className="text-zinc-400 text-sm">
              Không có video để phát
            </div>
          )
        )}

        {activeMode === "audio" && (
          <div className="absolute inset-0 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <img
              src={safePosterUrl}
              alt="Blur BG"
              className="absolute inset-0 size-full object-cover opacity-15 blur-3xl scale-125"
            />

            <div className="relative aspect-square w-full max-w-[360px] md:max-w-[400px] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-zinc-800">
              <img
                src={safePosterUrl}
                alt={title || "Poster"}
                className="size-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. THANH ĐIỀU KHIỂN PHÍA DƯỚI */}
      <div className="w-full max-w-4xl mx-auto space-y-4 bg-black/60 p-4 rounded-2xl backdrop-blur-md border border-zinc-900">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{title}</h2>
            <p className="text-sm text-zinc-400 truncate mt-1">{artist}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-2 rounded-full hover:bg-zinc-800/50 transition-colors cursor-pointer ${isLiked ? "text-green-500" : "text-zinc-400"}`}
              aria-label={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
              title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
            >
              <Heart className={`size-5 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button type="button" onClick={() => setIsShareModalOpen(true)} className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer hover:bg-zinc-800/50 rounded-full">
              <Share2 className="size-5" />
            </button>
          </div>
        </div>

        {/* Thanh Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={audioDuration || 100}
            value={audioCurrentTime}
            onChange={handleProgressChange}
            className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-green-500 transition-colors"
            style={{
              background: `linear-gradient(to right, #22c55e ${
                audioDuration ? (audioCurrentTime / audioDuration) * 100 : 0
              }%, #3f3f46 ${
                audioDuration ? (audioCurrentTime / audioDuration) * 100 : 0
              }%)`,
            }}
          />
          <div className="flex justify-between text-xs text-zinc-500 font-medium tabular-nums ">
            <span>{formatTime(audioCurrentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>

        {/* Thanh Nút bấm Media Control */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center pt-2">
          <div className="flex justify-end pr-6">
            <button
              type="button"
              onClick={onPrevious}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Bài trước"
              title="Bài trước"
            >
              <SkipBack className="size-6 fill-current" />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button type="button" onClick={togglePlay} className="flex size-14 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform cursor-pointer shadow-lg active:scale-95">
              {isPlaying ? <Pause className="size-6 fill-black" /> : <Play className="size-6 fill-black ml-0.5" />}
            </button>
          </div>

          <div className="flex min-w-0 items-center gap-4 pl-6 text-zinc-400">
            <button
              type="button"
              onClick={onNext}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Bài tiếp theo"
              title="Bài tiếp theo"
            >
              <SkipForward className="size-6 fill-current" />
            </button>
            <div className="ml-auto flex items-center gap-4">
            <button
              type="button"
              onClick={handleAddCurrentToQueue}
              className="hover:text-white cursor-pointer transition-colors"
              aria-label="Thêm bài hiện tại vào hàng chờ"
              title="Thêm bài hiện tại vào hàng chờ"
            >
              <ListPlus className="size-5" />
            </button>
            <div className="flex items-center gap-2 group/vol">
              <Volume2 className="size-5" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Âm lượng"
                className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-green-500"
                style={{
                  background: `linear-gradient(to right, #22c55e ${volume * 100}%, #3f3f46 ${volume * 100}%)`,
                }}
              />
            </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemToShare={{
          type: activeMode === "audio" ? "song" : "video", 
          id: mediaId || "", 
          title: title,
          subtitle: artist,
        }}
        onShareSuccess={(name: string, share: ShareItemDto) => {
          if (onShareSuccess) {
            const trackInfo = { title, artist, url: videoUrl, posterUrl };
            onShareSuccess(activeMode === "audio" ? "song" : "video", trackInfo, name, share);
          }
        }}
      />

      {showQueueToast && (
        <div className="fixed bottom-28 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg animate-[fadeIn_0.15s_ease-out]">
          Đã thêm vào Current Queue
        </div>
      )}

      {/* Queue selection is intentionally replaced by direct add-to-queue behavior.
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Thêm vào hàng chờ</h3>
                <p className="mt-1 text-xs text-zinc-400">Hiện có {queue.length} bài trong Current Queue</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQueuePickerOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                aria-label="Đóng"
                title="Đóng"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="custom-scrollbar mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
              {songs.length > 0 ? (
                songs.map((song) => {
                  const isQueued = queue.some((item) => item.id === song.id);

                  return (
                    <button
                      key={song.id}
                      type="button"
                      disabled={isQueued}
                      onClick={() => addToQueue(song)}
                      className="flex w-full items-center justify-between rounded-md p-3 text-left transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {song.posterUrl ? (
                          <img src={song.posterUrl} alt="" className="size-10 rounded object-cover" />
                        ) : (
                          <span className="flex size-10 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-400">Nhạc</span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-white">{song.title}</span>
                          <span className="block truncate text-xs text-zinc-400">{song.artist}</span>
                        </span>
                      </span>
                      {isQueued ? <Check className="size-4 text-green-500" /> : <ListPlus className="size-4 text-zinc-400" />}
                    </button>
                  );
                })
              ) : (
                <p className="py-5 text-center text-sm text-zinc-500">Chưa có bài hát để thêm vào hàng chờ.</p>
              )}
            </div>
          </div>
        </div>
      */}
    </div>
  );
};

export default VideoPlayerModal;
