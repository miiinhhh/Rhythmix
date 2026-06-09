import { X, Play, Pause, Maximize, Volume2, SkipBack, SkipForward, Shuffle, Repeat, Heart, Share2, ListMusic } from "lucide-react";
import { useRef, useState } from "react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  posterUrl: string;
  title: string;
  artist?: string;
}

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, posterUrl, title, artist = "Luna Nova" }: VideoPlayerModalProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    if (videoRef.current) videoRef.current.pause();
    setIsPlaying(false);
    setCurrentTime(0); // Reset thời gian về 0 để tránh lỗi lưu vết bài cũ
    setDuration(0);
    onClose();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-zinc-900 via-zinc-950 to-black w-screen h-screen text-white select-none overflow-hidden animate-fade-in">
      
      {/* 1. NÚT ĐÓNG (X) */}
      <button 
        type="button"
        onClick={handleCloseModal}
        className="absolute top-6 right-6 z-50 rounded-full p-2 bg-black/20 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
      >
        <X className="size-6" />
      </button>

      {/* 2. VÙNG HIỂN THỊ TRUNG TÂM */}
      <div className="relative flex-1 w-full flex items-center justify-center p-8 group">
        <div className="relative max-h-[70vh] aspect-[4/3] shadow-2xl rounded-md overflow-hidden bg-zinc-900">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl} 
            className="w-full h-full object-cover"
            onClick={togglePlay}
            onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
            onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
          />
          
          {/* Nút Play/Pause tròn to ở chính giữa màn hình */}
          {!isPlaying && (
            <button 
              type="button"
              onClick={togglePlay} // 🌟 ĐÃ THÊM: Click vào nút trắng này video sẽ phát bình thường
              className="absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-transform hover:scale-105 cursor-pointer z-10"
            >
              <Play className="size-8 fill-black ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* 3. THANH ĐIỀU KHIỂN CHI TIẾT DƯỚI ĐÁY */}
      <div className="w-full bg-gradient-to-t from-black via-black/80 to-transparent px-8 pb-8 pt-4 flex flex-col gap-4">
        
        {/* Thanh Progress Tua Nhạc/Video */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 w-full">
          <span>{formatTime(currentTime)}</span> 

          <div 
            className="flex-1 h-1 bg-zinc-700 rounded-full relative group cursor-pointer"
            onClick={(e) => {
              if (!videoRef.current || duration === 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const width = rect.width;
              const newTime = (clickX / width) * duration;
              videoRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }}
          >
            {/* Thanh màu xanh chạy tự động */}
            <div 
              className="absolute top-0 left-0 h-full bg-green-500 rounded-full group-hover:bg-green-400" 
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <span>{formatTime(duration)}</span> 
        </div>

        {/* Khối chức năng chính */}
        <div className="flex items-center justify-between w-full">
          
          {/* Cụm Trái: Tên bài hát + Ca sĩ + Tim + Share */}
          <div className="flex items-center gap-4 min-w-[240px]">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight truncate max-w-[200px]">{title}</h2>
              <p className="text-sm text-zinc-400 mt-0.5 truncate max-w-[200px]">{artist}</p>
            </div>
            <div className="flex gap-2 text-zinc-400 ml-2">
              <Heart 
                onClick={() => setIsLiked(!isLiked)}
                className={`size-5 cursor-pointer transition-colors ${isLiked ? "text-green-500 fill-green-500" : "hover:text-white"}`} 
              />
              <Share2 className="size-5 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Cụm Giữa */}
          <div className="flex items-center gap-6">
            <button type="button" className="text-zinc-400 hover:text-white transition-colors cursor-pointer"><Shuffle className="size-5" /></button>
            <button type="button" className="text-zinc-400 hover:text-white transition-colors cursor-pointer"><SkipBack className="size-6 fill-current" /></button>
            <button 
              type="button" 
              onClick={togglePlay}
              className="flex size-14 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform cursor-pointer"
            >
              {isPlaying ? <Pause className="size-6 fill-black" /> : <Play className="size-6 fill-black ml-0.5" />}
            </button>
            <button type="button" className="text-zinc-400 hover:text-white transition-colors cursor-pointer"><SkipForward className="size-6 fill-current" /></button>
            <button type="button" className="text-zinc-400 hover:text-white transition-colors cursor-pointer"><Repeat className="size-5" /></button>
          </div>

          {/* Cụm Phải */}
          <div className="flex items-center gap-4 min-w-[240px] justify-end text-zinc-400">
            <ListMusic className="size-5 hover:text-white cursor-pointer transition-colors" />
            <div className="flex items-center gap-2 group/vol">
              <Volume2 className="size-5 hover:text-white cursor-pointer" />
              <div className="w-20 h-1 bg-zinc-700 rounded-full relative cursor-pointer">
                <div className="absolute top-0 left-0 h-full w-[70%] bg-white rounded-full group-hover/vol:bg-green-500" />
              </div>
            </div>
            <button type="button" onClick={handleCloseModal} className="hover:text-white transition-colors cursor-pointer">
              <Maximize className="size-5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default VideoPlayerModal;