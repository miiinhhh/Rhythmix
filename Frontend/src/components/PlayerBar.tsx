import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Heart,
  Music2,
  Maximize2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import VideoPlayerModal from "./VideoPlayerModal";

interface SongType {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
}

interface PlayerBarProps {
  currentTrack: SongType | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
  onOpenVideo: () => void;
}

const PlayerBar = ({
  currentTrack,
  isPlaying,
  setIsPlaying,
  setSongs,
  onOpenVideo,
}: PlayerBarProps) => {
  // 3. Tạo "điều khiển từ xa" để điều khiển thẻ audio ngầm của trình duyệt
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔽 THÊM 2 DÒNG NÀY ĐỂ QUẢN LÝ THỜI GIAN 🔽
  const [currentTime, setCurrentTime] = useState(0); // Số giây hiện tại (Ví dụ: 10s)
  const [duration, setDuration] = useState(0); // Tổng số giây (Ví dụ: 243s)

  // Hàm này chạy liên tục khi nhạc đang phát để cập nhật số giây hiện tại
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Hàm này chạy đúng 1 lần khi bài nhạc vừa tải xong để biết bài này dài bao nhiêu giây
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Hàm xử lý khi người dùng kéo thanh trượt để TUA NHẠC (SEEK)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime; // Bắt đầu phát từ giây mới gõ/kéo
      setCurrentTime(newTime);
    }
  };

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
  const [volume, setVolume] = useState(0.5);

  // Hàm xử lý khi kéo thanh âm lượng
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume; // Ra lệnh cho thẻ audio ngầm tăng/giảm âm lượng thật
    }
  };
  {
    /* Tính phần trăm đã phát: (thời gian hiện tại / tổng thời gian) * 100 */
  }
  const calculateProgressPercent = () => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  };

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying && currentTrack) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // When track ends, update parent state
  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <footer className="flex h-20 shrink-0 items-center justify-between gap-4 border-t border-zinc-800 bg-zinc-900 px-4 text-white">
      {/* THẺ AUDIO NGẦM (Không hiển thị ra màn hình nhưng làm nhiệm vụ phát nhạc) */}
      <audio
        ref={audioRef}
        src={currentTrack?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Now playing */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-zinc-800">
          <Music2 className="size-6 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {currentTrack ? currentTrack.title : "Chưa chọn bài hát"}
          </p>
          <p className="truncate text-xs text-zinc-400">
            {currentTrack ? currentTrack.artist : "Không có ca sĩ"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!currentTrack) return; // Nếu chưa phát bài nào thì không cho bấm

            // 🌟 Bắn lệnh thay đổi dữ liệu lên file cha AppLayout
            setSongs((prev) =>
              prev.map((song) =>
                song.id === currentTrack.id
                  ? { ...song, isLiked: !song.isLiked }
                  : song,
              ),
            );
          }}
          className="ml-2 hidden text-zinc-400 transition-colors hover:text-white sm:block"
          aria-label={currentTrack?.isLiked ? "Unlike" : "Like"}
        >
          {/* Tui thêm tí hiệu ứng scale-110 cho tim to lên xíu khi được Like nhìn cho đã mắt */}
          <Heart
            className={`size-4 transition-all duration-200 ${currentTrack?.isLiked ? "text-green-500 fill-green-500 scale-110" : ""}`}
          />
        </button>
      </div>

      {/* Controls */}
      <div className="flex max-w-md flex-1 flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <button type="button" className="text-zinc-400 hover:text-white">
            <Shuffle className="size-4" />
          </button>
          <button type="button" className="text-zinc-400 hover:text-white">
            <SkipBack className="size-5 fill-current" />
          </button>
          {/* NÚT PLAY/PAUSE THÔNG MINH ĐƯỢC THAY THẾ KHÚC NÀY */}
          <button
            type="button"
            onClick={handlePlayPause} // THÊM SỰ KIỆN CLICK
            className="flex size-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 cursor-pointer"
          >
            {/* THÊM ĐIỀU KIỆN ĐỔI ICON Ở ĐÂY */}
            {isPlaying ? (
              <Pause className="size-4 fill-black text-black" />
            ) : (
              <Play className="size-4 fill-black text-black ml-0.5" />
            )}
          </button>
          <button type="button" className="text-zinc-400 hover:text-white">
            <SkipForward className="size-5 fill-current" />
          </button>
          <button type="button" className="text-zinc-400 hover:text-white">
            <Repeat className="size-4" />
          </button>
        </div>

        {/* Progress Timeline Slider UI */}
        <div className="flex w-full items-center gap-2">
          <span className="text-xs text-zinc-400 tabular-nums">
            {formatTime(currentTime)}
          </span>
          {/* Thanh trượt thật giúp người dùng kéo để SEEK (Tua nhạc) */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek} // Kéo tới đâu chạy hàm Seek tới đó
            className="h-1 flex-1 accent-green-500 bg-zinc-700 rounded-full cursor-pointer appearance-none"
            style={{
              background: `linear-gradient(to right, #22c55e ${calculateProgressPercent()}%, #3f3f46 ${calculateProgressPercent()}%)`,
            }}
          />
          {/* Hiển thị tổng thời lượng thật của bài hát */}
          <span className="text-xs text-zinc-400 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume UI */}
      <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
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
        <button
          type="button"
          onClick={onOpenVideo} // Click phát là gọi hàm mở Fullscreen trên file cha
          className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
          title="Phóng to toàn màn hình"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>
    </footer>
  );
};

export default PlayerBar;
