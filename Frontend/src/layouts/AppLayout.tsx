import SideBar from "../components/SideBar";
import PlayerBar from "../components/PlayerBar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import AuthModal from "../components/AuthModal";
import VideoPlayerModal from "../components/VideoPlayerModal";

const initialSongs = [
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
];
const AppLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const [songs, setSongs] = useState(initialSongs);
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Tự động tìm ra thông tin chi tiết của bài hát dựa trên ID đang chọn
  const currentTrack = songs.find((song) => song.id === currentSongId) || null;
  // Hàm xử lý khi user đăng nhập/đăng ký thành công từ Modal
  const handleAuthSuccess = (name: string) => {
    setIsAuthenticated(true); // Đánh dấu đã đăng nhập thành công 
  };
  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white select-none font-sans">
      <AuthModal
        open={!isAuthenticated}
        onClose={() => undefined}
        onAuthenticated={handleAuthSuccess}
      />

      {isAuthenticated && (
        <>
          <div className="flex min-h-0 flex-1">
            <SideBar onOpenAuth={() => setIsAuthenticated(false)} />

            <main className="m-2 ml-0 flex-1 overflow-y-auto rounded-lg bg-zinc-900 p-6">
              <Outlet context={{ currentSongId, setCurrentSongId, isPlaying, setIsPlaying, songs, setSongs }} />
            </main>
          </div>

          <PlayerBar 
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            setSongs={setSongs}
            onOpenVideo={() => setIsVideoOpen(true)}
          />
        </>
      )}
      <VideoPlayerModal 
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl="https://media.istockphoto.com/id/1400382484/vi/video/t%C3%A1c-%C4%91%E1%BB%99ng-c%E1%BB%A7a-ti%E1%BB%83u-h%C3%A0nh-tinh-tr%C3%AAn-tr%C3%A1i-%C4%91%E1%BA%A5t-ti%E1%BB%83u-h%C3%A0nh-tinh-sao-ch%E1%BB%95i-thi%C3%AAn-th%E1%BA%A1ch-ph%C3%A1t-s%C3%A1ng-%C4%91i.mp4?p=1&s=mp4-640x640-is&k=20&c=s7GG-mPFa0btByLlpoqGhDLm7FQO2z0cZJuxLBFhRpc="
        posterUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000" // Ảnh thumbnail concert
        title={currentTrack ? currentTrack.title : "Live Concert"}
      />
    </div>
  );
};

export default AppLayout;
