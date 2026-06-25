import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Music2,
  Maximize2,
  Share2,
  ListMusic,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ShareModal from "./ShareModal";
import type { ShareItemDto } from "../types/api";
import type { SongType } from "../utils/mediaMapping";
import { userService } from "../api/userService";
import { resolveAssetUrl } from "../config/apiConfig";

interface PlayerBarProps {
  currentTrack: SongType | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
  volume: number;
  setVolume: (volume: number) => void;
  onOpenVideo: () => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  seekTrigger: { time: number } | null;
  onShareSuccess?: (
    type: "song" | "video",
    trackInfo: any,
    receiverName: string,
    share?: ShareItemDto,
  ) => void;
  onToggleQueueSidebar?: () => void;
  onToggleNowPlayingSidebar?: () => void;
  isNowPlayingSidebarOpen?: boolean;
  onTrackEnded?: () => void;
  onNext: () => void;
  onPrevious: () => void;
}
const resolveAudioUrl = (url?: string | null) => {
  if (!url) return undefined;
  return resolveAssetUrl(url);
};

const PlayerBar = ({
  currentTrack,
  isPlaying,
  setIsPlaying,
  setSongs,
  volume,
  setVolume,
  onOpenVideo,
  onTimeUpdate,
  seekTrigger,
  onShareSuccess,
  onToggleQueueSidebar,
  onToggleNowPlayingSidebar,
  isNowPlayingSidebarOpen,
  onTrackEnded,
  onNext,
  onPrevious,
}: PlayerBarProps) => {
  // 3. Tạo "điều khiển từ xa" để điều khiển thẻ audio ngầm của trình duyệt
  const audioRef = useRef<HTMLMediaElement | null>(null);

  const audioSrc = resolveAudioUrl(
    currentTrack
      ? (currentTrack.url ||
          (currentTrack as any).audioUrl ||
          (currentTrack as any).fileUrl ||
          undefined)
      : undefined,
  );

  const mediaKind = (
    currentTrack?.mediaType ||
    (currentTrack as any)?.mimeType ||
    (currentTrack as any)?.contentType ||
    ""
  )
    .toString()
    .toLowerCase()
    .trim();

  const isVideoTrack =
    mediaKind === "video" ||
    mediaKind.startsWith("video/") ||
    Boolean(currentTrack?.videoUrl?.trim());

  // 🔽 THÊM 2 DÒNG NÀY ĐỂ QUẢN LÝ THỜI GIAN 🔽
  const [currentTime, setCurrentTime] = useState(0); // Số giây hiện tại (Ví dụ: 10s)
  const [duration, setDuration] = useState(0); // Tổng số giây (Ví dụ: 243s)

  // 🟢 Liên tục báo cáo số giây lên AppLayout khi nhạc phát
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setCurrentTime(current);
      onTimeUpdate(current, audioRef.current.duration || 0);
    }
  };
  // 🟢 Báo cáo thời lượng tổng ngay khi nhạc vừa tải xong
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration || 0;
      setDuration(dur);
      onTimeUpdate(audioRef.current.currentTime, dur);
    }
  };

  // Hàm xử lý khi người dùng kéo thanh trượt trực tiếp ở PlayerBar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      onTimeUpdate(newTime, duration);
    }
  };

  // 🟢 ĐÓN NHẬN LỆNH TUA TỪ TRONG VIDEO_PLAYER_MODAL TRUYỀN SANG
  useEffect(() => {
    if (seekTrigger !== null && audioRef.current) {
      audioRef.current.currentTime = seekTrigger.time;
      setCurrentTime(seekTrigger.time);
    }
  }, [seekTrigger]);

  // Hàm phụ để biến đổi số giây (Ví dụ: 90 giây) thành định dạng phút:giây dễ đọc (01:30)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 4. Hàm xử lý khi người dùng bấm nút Play/Pause (ngan vi cha da lam roi)
  const handlePlayPause = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };
  // Tạo state lưu âm lượng, mặc định ban đầu là 0.5 (50% âm lượng)
  // Hàm xử lý khi kéo thanh âm lượng
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume; // Ra lệnh cho thẻ audio ngầm tăng/giảm âm lượng thật
    }
  };
  const calculateProgressPercent = () => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  };

  useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  audio.volume = volume;
}, [volume, audioSrc, isVideoTrack]);

useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;

  setCurrentTime(0);
  setDuration(0);
  onTimeUpdate(0, 0);

  if (!audioSrc) {
    audio.removeAttribute("src");
    audio.load();
    setIsPlaying(false);
    return;
  }

  audio.load();
}, [audioSrc, isVideoTrack]);

useEffect(() => {
  const audio = audioRef.current;
  if (!audio || !audioSrc) return;

  if (isPlaying) {
    audio.play().catch((error) => {
      console.error("Không phát được bài này:", audioSrc, error);
      setIsPlaying(false);
    });
  } else {
    audio.pause();
  }
}, [isPlaying, audioSrc, isVideoTrack]);

  // When track ends, update parent state
  const handleEnded = () => {
    setIsPlaying(false);
    onTrackEnded?.();
  };

  // 🟢 State quản lý ẩn/hiển thị ShareModal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPosterUnavailable, setIsPosterUnavailable] = useState(false);

  useEffect(() => {
    setIsPosterUnavailable(false);
  }, [currentTrack?.posterUrl]);

  // 🟢 Hàm click nút Share ở PlayerBar: Luôn luôn ép type là "song"
  const handleShareClick = () => {
    if (!currentTrack) return; // Không có bài hát thì không làm gì
    setIsShareModalOpen(true);
  };

  const handleMobilePlayerBarClick = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (!currentTrack) return;
    if (window.matchMedia("(min-width: 768px)").matches) return;
    if ((event.target as HTMLElement).closest("button, input")) return;

    onOpenVideo();
  };

  return (
    <footer
      onClick={handleMobilePlayerBarClick}
      className="relative flex h-20 shrink-0 items-center justify-between gap-2 border-t border-zinc-200 bg-white px-3 pt-0.5 text-zinc-950 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white md:gap-4 md:px-4"
    >
      {/* THẺ AUDIO NGẦM (Không hiển thị ra màn hình nhưng làm nhiệm vụ phát nhạc) */}
      {isVideoTrack ? (
        <video
          ref={(el) => {
            audioRef.current = el;
          }}
          src={audioSrc ?? undefined}
          preload="metadata"
          playsInline
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            opacity: 0,
            pointerEvents: "none",
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={() => {
            console.error("Video lỗi:", audioSrc, audioRef.current?.error);
            setIsPlaying(false);
          }}
        />
      ) : (
        <audio
          ref={(el) => {
            audioRef.current = el;
          }}
          src={audioSrc ?? undefined}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={() => {
            console.error("Audio lỗi:", audioSrc, audioRef.current?.error);
            setIsPlaying(false);
          }}
        />
      )}

      {/* Now playing */}
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-800 md:size-14">
          {currentTrack?.posterUrl && !isPosterUnavailable ? (
            <img
              src={currentTrack.posterUrl}
              alt={currentTrack.title}
              className="size-full object-cover"
              onError={() => setIsPosterUnavailable(true)}
            />
          ) : (
            <Music2 className="size-6 text-zinc-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {currentTrack ? currentTrack.title : "Chưa chọn bài hát"}
          </p>
          <p className="truncate text-xs text-zinc-400">
            {currentTrack ? currentTrack.artist : "Không có ca sĩ"}
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (!currentTrack) return;

            try {
              await userService.toggleFavorite(currentTrack.id);

              setSongs((prev) =>
                prev.map((song) =>
                  song.id === currentTrack.id
                    ? { ...song, isLiked: !song.isLiked }
                    : song,
                ),
              );
            } catch (err) {
              console.error("Toggle favorite failed:", err);
            }
          }}
          className="text-zinc-400 transition-colors hover:text-white cursor-pointer"
          aria-label={currentTrack?.isLiked ? "Unlike" : "Like"}
        >
          {/* Tui thêm tí hiệu ứng scale-110 cho tim to lên xíu khi được Like nhìn cho đã mắt */}
          <Heart
            className={`size-4 transition-all duration-200 ${currentTrack?.isLiked ? "text-green-500 fill-green-500 scale-110" : ""}`}
          />
        </button>
        <button
          type="button"
          disabled={!currentTrack} // Nếu chưa phát bài nào thì không cho bấm
          onClick={handleShareClick}
          className={`text-zinc-400 transition-colors hover:text-white cursor-pointer ${
            !currentTrack
              ? "opacity-30 cursor-not-allowed hover:text-zinc-400"
              : ""
          }`}
          aria-label="Share"
        >
          <Share2 className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onToggleQueueSidebar?.()}
          className="text-zinc-400 transition-colors hover:text-white cursor-pointer md:hidden"
          aria-label="Open queue"
        >
          <ListMusic className="size-4" />
        </button>
        <button
          type="button"
          onClick={handlePlayPause}
          className="flex items-center justify-center transition-transform hover:scale-105 cursor-pointer md:hidden"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="size-6 fill-white text-white" />
          ) : (
            <Play className="size-6 fill-white text-white ml-0.5" />
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="hidden max-w-md flex-1 flex-col items-center gap-2 md:flex">
        {/* Desktop/tablet controls with progress */}
        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={onPrevious}
            className="text-zinc-400 hover:text-white"
          >
            <SkipBack className="size-5 fill-current" />
          </button>
          <button
            type="button"
            onClick={handlePlayPause}
            className="flex size-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="size-4 fill-black text-black" />
            ) : (
              <Play className="size-4 fill-black text-black ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="text-zinc-400 hover:text-white"
          >
            <SkipForward className="size-5 fill-current" />
          </button>
        </div>
        {/* Desktop/tablet progress bar with time */}
        <div className="hidden md:flex w-full items-center gap-2">
          <span className="text-xs text-zinc-400 tabular-nums">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="h-1 flex-1 accent-green-500 bg-zinc-700 rounded-full cursor-pointer appearance-none"
            style={{
              background: `linear-gradient(to right, #22c55e ${calculateProgressPercent()}%, #3f3f46 ${calculateProgressPercent()}%)`,
            }}
          />
          <span className="text-xs text-zinc-400 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
        {/* Mobile play/pause only */}
        <div className="flex md:hidden items-center justify-center">
          <button
            type="button"
            onClick={handlePlayPause}
            className="flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="size-6 fill-white text-white" />
            ) : (
              <Play className="size-6 fill-white text-white ml-0.5" />
            )}
          </button>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
        <button
          type="button"
          onClick={() => onToggleQueueSidebar?.()}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Open queue"
        >
          <ListMusic className="size-4" />
        </button>
        <button
          type="button"
          disabled={!currentTrack}
          onClick={() => onToggleNowPlayingSidebar?.()}
          className={`text-zinc-400 transition-colors hover:text-white cursor-pointer ${
            !currentTrack ? "cursor-not-allowed opacity-30 hover:text-zinc-400" : ""
          }`}
          aria-label={isNowPlayingSidebarOpen ? "Đóng thông tin bài hát" : "Mở thông tin bài hát"}
          title={isNowPlayingSidebarOpen ? "Đóng thông tin bài hát" : "Mở thông tin bài hát"}
        >
          {isNowPlayingSidebarOpen ? (
            <PanelRightClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
        </button>
        {/* Volume UI - ẩn trên mobile để tiết kiệm diện tích */}
        <div className="hidden md:flex items-center gap-2">
          <Volume2 className="size-4 text-zinc-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="h-1 w-24 accent-green-500 bg-zinc-700 rounded-full cursor-pointer appearance-none"
            style={{
              background: `linear-gradient(to right, #22c55e ${volume * 100}%, #3f3f46 ${volume * 100}%)`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={onOpenVideo} // Click phát là gọi hàm mở Fullscreen trên file cha
          className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
          title="Phóng to toàn màn hình"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>
      {/* Mobile: Thin progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 md:hidden">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="mobile-player-progress h-0.5 w-full cursor-pointer appearance-none bg-zinc-700"
          style={{
            background: `linear-gradient(to right, #22c55e ${calculateProgressPercent()}%, #3f3f46 ${calculateProgressPercent()}%)`,
          }}
        />
      </div>

      {/* 🟢 Render ShareModal tại đây */}
      {currentTrack && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          itemToShare={{
            type: "song", // Ở PlayerBar thì luôn luôn là bài hát
            id: currentTrack.id,
            title: currentTrack.title,
            subtitle: currentTrack.artist, // Truyền ca sĩ vào subtitle
          }}
          onShareSuccess={(name: string, share: ShareItemDto) => {
            if (onShareSuccess) {
              onShareSuccess("song", currentTrack, name, share);
            }
          }}
        />
      )}
    </footer>
  );
};

export default PlayerBar;
