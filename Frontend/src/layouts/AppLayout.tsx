import SideBar from "../components/SideBar";
import PlayerBar from "../components/PlayerBar";
import { Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import AuthModal from "../components/AuthModal";
import VideoPlayerModal from "../components/VideoPlayerModal";
import { authService, signalRService } from "../api";
import { MOCK_USERS } from "../data/mockData";
import { useNotifications, NotificationContext } from "../context/NotificationContext";

const initialSongs = [
  {
    id: 1,
    title: "Sunset Boulevard",
    artist: "Neon Coast",
    album: "City Lights",
    duration: "0:41",
    isLiked: true,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    videoUrl:
      "https://media.istockphoto.com/id/1400382484/vi/video/t%C3%A1c-%C4%91%E1%BB%99ng-c%E1%BB%A7a-ti%E1%BB%83u-h%C3%A0nh-tinh-tr%C3%A1i-%C4%91%E1%BA%A5t-ti%E1%BB%83u-h%C3%A0nh-tinh-sao-ch%E1%BB%95i-thi%E1%BB%87t-ph%C3%A1t-s%C3%A1ng-%C4%91i.mp4?p=1&s=mp4-640x640-is&k=20&c=s7GG-mPFa0btByLlpoqGhDLm7FQO2z0cZJuxLBFhRpc=",
    posterUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000",
  },
  {
    id: 2,
    title: "Velvet Sky",
    artist: "Aria Lane",
    album: "Nightfall",
    duration: "0:45",
    isLiked: false,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    posterUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000",
  },
  {
    id: 3,
    title: "Paper Planes",
    artist: "The Drifters",
    album: "Horizons",
    duration: "0:50",
    isLiked: false,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    posterUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000",
  },
  {
    id: 4,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    isLiked: false,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-neon-light-from-a-tunnel-in-a-modern-city-43254-large.mp4",
    posterUrl:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000",
  },
  {
    id: 5,
    title: "Starboy",
    artist: "The Weeknd",
    album: "Starboy",
    duration: "3:50",
    isLiked: false,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-42300-large.mp4",
    posterUrl:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000",
  },
];

interface InboxMessageType {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  avatarColor: string;
  sharedType: "song" | "video" | "playlist";
  trackData?: any;
  playlistData?: {
    id: string;
    title: string;
    coverUrl?: string;
    description?: string;
  };
  time: string;
}

const AppLayout = () => {
  const navigate = useNavigate();
  useContext(NotificationContext);

  const { addNotification, addMessage, allMessages } = useNotifications();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem("token")
  );
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const [songs, setSongs] = useState(initialSongs);
  const [currentSongId, setCurrentSongId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [seekTrigger, setSeekTrigger] = useState<{ time: number } | null>(null);

  const currentTrack =
    songs.find((song) => song.id === currentSongId) ||
    allMessages.find((msg) => msg.trackData?.id === currentSongId)?.trackData ||
    null;

  const handleAuthSuccess = (_name: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (!localStorage.getItem("currentUserId")) {
      localStorage.setItem("currentUserId", "user-alex");
      localStorage.setItem("currentUserName", "Alex Mercer");
    }
  }, []);

  // SignalR real-time notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const connectSignalR = async () => {
      try {
        await signalRService.connect(token);
      } catch {
        // ignore connection failures; UI should still work
      }
    };

    connectSignalR();
    return () => {
      signalRService.disconnect();
    };
  }, [isAuthenticated]);

  const handleShareSuccess = (
    type: "song" | "video" | "playlist",
    itemInfo: any,
    receiverName: string
  ) => {
    const currentUserId = localStorage.getItem("currentUserId") || "user-alex";
    const currentUserName = localStorage.getItem("currentUserName") || "Alex Mercer";

    const foundReceiver = MOCK_USERS.find((user) =>
      user.name.toLowerCase().includes(receiverName.toLowerCase())
    );

    const targetReceiverId = foundReceiver ? foundReceiver.id : currentUserId;
    const targetReceiverName = foundReceiver ? foundReceiver.name : receiverName;

    const newShareMessage: InboxMessageType = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      receiverId: targetReceiverId,
      receiverName: targetReceiverName,
      avatarColor: currentUserId.includes("ross") ? "bg-purple-500" : "bg-blue-500",
      sharedType: type,
      time: new Date().toISOString(),
    };

    if (type === "playlist") {
      newShareMessage.playlistData = {
        id: itemInfo.id,
        title: itemInfo.title,
        coverUrl: itemInfo.coverUrl || itemInfo.posterUrl || "",
        description: itemInfo.description || "Playlist được chia sẻ",
      };
    } else {
      const originalTrack = initialSongs.find(
        (s) => s.title.toLowerCase() === itemInfo.title.toLowerCase()
      );

      newShareMessage.trackData = originalTrack
        ? { ...originalTrack }
        : { ...itemInfo, id: itemInfo.id || 1 };
    }

    const getNotificationType = (t: string) => {
      if (t === "playlist") return "share_playlist";
      if (t === "video") return "share_video";
      return "share_song";
    };

    addNotification({
      id: newShareMessage.id,
      receiverId: targetReceiverId,
      type: getNotificationType(type),
      payload: JSON.stringify({
        senderName: currentUserName,
        itemName: itemInfo.title,
        itemId: newShareMessage.id,
      }),
      time: "Vừa xong",
      isRead: false,
    });

    addMessage(newShareMessage);
  };

  const defaultVideo =
    "https://media.istockphoto.com/id/1400382484/vi/video/t%C3%A1c-%C4%91%E1%BB%99ng-c%E1%BB%A7a-ti%E1%BB%83u-h%C3%A0nh-tinh-tr%C3%A1i-%C4%91%E1%BA%A5t-ti%E1%BB%83u-h%C3%A0nh-tinh-sao-ch%E1%BB%95i-thi%E1%BB%87t-ph%C3%A1t-s%C3%A1ng-%C4%91i.mp4?p=1&s=mp4-640x640-is&k=20&c=s7GG-mPFa0btByLlpoqGhDLm7FQO2z0cZJuxLBFhRpc=";
  const defaultPoster =
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000";

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
              <Outlet
                context={
                  {
                    currentSongId,
                    setCurrentSongId,
                    isPlaying,
                    setIsPlaying,
                    songs,
                    setSongs,
                    onOpenVideo: () => setIsVideoOpen(true),
                    onShareSuccess: handleShareSuccess,
                    onNavigateToPlaylist: (playlistId: string) => {
                      navigate(`/playlist/${playlistId}`);
                    },
                    seekTrigger,
                    setSeekTrigger,
                  } as any
                }
              />
            </main>
          </div>

          <PlayerBar
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            setSongs={setSongs as any}
            onOpenVideo={() => setIsVideoOpen(true)}
            onTimeUpdate={(currentTime, duration) => {
              setAudioCurrentTime(currentTime);
              setAudioDuration(duration);
            }}
            seekTrigger={seekTrigger}
            onShareSuccess={handleShareSuccess}
          />
        </>
      )}

      <VideoPlayerModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={currentTrack?.videoUrl || defaultVideo}
        posterUrl={currentTrack?.posterUrl || defaultPoster}
        title={currentTrack?.title || "Live Concert"}
        artist={currentTrack?.artist || "Luna Nova"}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        audioCurrentTime={audioCurrentTime}
        audioDuration={audioDuration}
        onShareSuccess={handleShareSuccess}
        onSeekAudio={(time) => setSeekTrigger({ time })}
      />
    </div>
  );
};

export default AppLayout;

