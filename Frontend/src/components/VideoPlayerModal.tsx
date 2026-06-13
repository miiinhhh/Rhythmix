import { X, Play, Pause, Maximize, Volume2, SkipBack, SkipForward, Shuffle, Repeat, Heart, Share2, ListMusic } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import ShareModal from "./ShareModal";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  posterUrl: string;
  title: string;
  artist?: string;
  onShareSuccess?: (type: "song" | "video", trackInfo: any, receiverName: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  audioCurrentTime: number; 
  audioDuration: number;    
  onSeekAudio: (time: number) => void; 
}

const VideoPlayerModal = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  posterUrl, 
  title, 
  artist = "Luna Nova", 
  isPlaying, 
  setIsPlaying, 
  audioCurrentTime, 
  audioDuration, 
  onSeekAudio,
  onShareSuccess
}: VideoPlayerModalProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0); 

  // Mặc định về chế độ Video để khi click vào Video trong Inbox là thấy liền hình
  const [activeMode, setActiveMode] = useState<"audio" | "video">("video");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 🟢 EFFECT 1: Khi vừa mở modal lên, đồng bộ hình ảnh giật về đúng vị trí giây của nhạc nền
  useEffect(() => {
    if (isOpen) {
      setActiveMode("video");
      if (videoRef.current && videoDuration > 0) {
        videoRef.current.currentTime = audioCurrentTime % videoDuration; 
        if (isPlaying) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => { /* Tránh quăng lỗi đỏ console khi luồng chưa nạp xong */ });
          }
        }
      }
    }
  }, [isOpen, videoDuration]);
  
  // 🟢 EFFECT 2: Sửa dứt điểm lỗi lệch pha Play/Pause, bọc Promise chống freeze video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isOpen) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Video chưa sẵn sàng phát hoặc bị gián đoạn nhẹ:", error.message);
        });
      }
    } else {
      // 💡 Đợi luồng play() chạy xong hoàn toàn bằng một khoảng hoãn siêu nhỏ (50ms) trước khi ra lệnh dừng
      const timer = setTimeout(() => {
        if (!video.paused && !isPlaying) {
          video.pause();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, isOpen]);
  
  // 🟢 EFFECT 3: Đồng bộ mượt mà khi đổi Link bài hát/video (Khắc phục lỗi đứng hình khi audio đang chạy sẵn)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || !isOpen) return;

    video.load(); // Khởi động lại luồng load video sạch từ đầu
    
    if (videoDuration > 0) {
      video.currentTime = audioCurrentTime % videoDuration;
    }

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [videoUrl, isOpen, videoDuration]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    if (videoRef.current) videoRef.current.pause();
    onClose();
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying); 
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration); 
      // Đồng bộ ngay lập tức khi metadata video load xong
      videoRef.current.currentTime = audioCurrentTime % videoRef.current.duration;
    }
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
        <video
          ref={videoRef}
          src={videoUrl}
          muted={true} 
          loop={true}  
          playsInline={true}
          onLoadedMetadata={handleLoadedMetadata}
          className={`max-h-[75vh] max-w-full object-contain rounded-lg transition-opacity duration-300 ${
            activeMode === "video" ? "opacity-100" : "opacity-0 absolute pointer-events-none"
          }`}
          onClick={togglePlay}
        />

        {activeMode === "audio" && (
          <div className="absolute inset-0 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <img src={posterUrl} alt="Blur BG" className="absolute inset-0 size-full object-cover opacity-15 blur-3xl scale-125" />
            <div className="relative aspect-square w-full max-w-[360px] md:max-w-[400px] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-zinc-800">
              <img src={posterUrl} alt={title} className="size-full object-cover" />
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
            <button type="button" onClick={() => setIsLiked(!isLiked)} className={`p-2 rounded-full hover:bg-zinc-800/50 transition-colors cursor-pointer ${isLiked ? "text-green-500" : "text-zinc-400"}`}>
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
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 min-w-[240px]">
            <button type="button" className="text-zinc-400 hover:text-white transition-colors cursor-pointer"><Shuffle className="size-5" /></button>
            <button type="button" className="text-zinc-400 hover:text-white transition-colors cursor-pointer"><SkipBack className="size-6 fill-current" /></button>
          </div>

          <div className="flex items-center justify-center">
            <button type="button" onClick={togglePlay} className="flex size-14 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform cursor-pointer shadow-lg active:scale-95">
              {isPlaying ? <Pause className="size-6 fill-black" /> : <Play className="size-6 fill-black ml-0.5" />}
            </button>
          </div>

          <div className="flex items-center gap-4 min-w-[240px] justify-end text-zinc-400">
            <ListMusic className="size-5 hover:text-white cursor-pointer transition-colors" />
            <div className="flex items-center gap-2 group/vol">
              <Volume2 className="size-5 hover:text-white cursor-pointer" />
              <div className="w-20 h-1 bg-zinc-700 rounded-full relative cursor-pointer">
                <div className="absolute top-0 left-0 h-full w-[70%] bg-white rounded-full group-hover/vol:bg-green-500" />
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
          id: title, 
          title: title,
          subtitle: artist,
        }}
        onShareSuccess={(name: string) => {
          if (onShareSuccess) {
            const trackInfo = { title, artist, url: videoUrl, posterUrl };
            onShareSuccess(activeMode === "audio" ? "song" : "video", trackInfo, name);
          }
        }}
      />
    </div>
  );
};

export default VideoPlayerModal;