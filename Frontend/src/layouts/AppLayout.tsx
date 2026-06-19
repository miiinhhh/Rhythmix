import SideBar from "../components/SideBar";
import PlayerBar from "../components/PlayerBar";
import { Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthModal from "../components/AuthModal";
import VideoPlayerModal from "../components/VideoPlayerModal";
import QueueSidebar from "../components/QueueSidebar";
import { mediaService, signalRService } from "../api";
import {
  useNotifications,
  NotificationContext,
} from "../context/NotificationContext";
import { mapMediaToSong, type SongType } from "../utils/mediaMapping";

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
    () => !!localStorage.getItem("token"),
  );
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const [songs, setSongs] = useState<SongType[]>([]);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [seekTrigger, setSeekTrigger] = useState<{ time: number } | null>(null);

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [playlistQueue, setPlaylistQueue] = useState<SongType[]>([]);

  const handleSetPlaylistQueue = (_id: string, tracks: SongType[]) => {
    setPlaylistQueue(tracks);
  };
  const currentIndex = playlistQueue.findIndex((t) => t.id === currentSongId);
  const nextSongs = currentIndex !== -1 ? playlistQueue.slice(currentIndex + 1) : [];

  const currentTrack =
    songs.find((song) => song.id === currentSongId) ||
    allMessages.find((msg) => msg.trackData?.id === currentSongId)?.trackData ||
    null;

  const handleAuthSuccess = (_name: string) => {
      setIsAuthenticated(true);
    };
    const handleNext = () => {
    const currentIndex = playlistQueue.findIndex((t) => t.id === currentSongId);
  
    // Nếu bài hiện tại không tìm thấy hoặc là bài cuối rồi thì dừng
    if (currentIndex === -1 || currentIndex >= playlistQueue.length - 1) {
      setIsPlaying(false);
      setCurrentSongId(null);
      return;
    }

    // Nếu còn bài tiếp theo thì chuyển
    const next = playlistQueue[currentIndex + 1];
    setCurrentSongId(next.id);
    setIsPlaying(true);
  };

const handlePrevious = () => {
  const currentIndex = playlistQueue.findIndex((t) => t.id === currentSongId);
  if (currentIndex > 0) {
    setCurrentSongId(playlistQueue[currentIndex - 1].id);
  }
};

  useEffect(() => {
    let isMounted = true;

    const loadSongs = async () => {
      try {
        const mediaItems = await mediaService.getDiscovery();
        if (!isMounted) return;

        setSongs(mediaItems.map(mapMediaToSong));
      } catch {
        if (isMounted) setSongs([]);
      }
    };

    loadSongs();

    return () => {
      isMounted = false;
    };
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
    receiverName: string,
  ) => {
    const currentUserId = localStorage.getItem("currentUserId") || "";
    const currentUserName =
      localStorage.getItem("currentUserName") || "Current user";

    const targetReceiverId = currentUserId;
    const targetReceiverName = receiverName;

    const newShareMessage: InboxMessageType = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      receiverId: targetReceiverId,
      receiverName: targetReceiverName,
      avatarColor: currentUserId.includes("ross")
        ? "bg-purple-500"
        : "bg-blue-500",
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
      newShareMessage.trackData = { ...itemInfo };
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
                    onSetPlaylistQueue: (
                      playlistId: string,
                      tracks: SongType[],
                    ) => {
                      handleSetPlaylistQueue(playlistId, tracks);
                    },
                    openQueue: () => setIsQueueOpen(true),
                    closeQueue: () => setIsQueueOpen(false),
                    toggleQueue: () => setIsQueueOpen((v) => !v),
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
            onToggleQueueSidebar={() => setIsQueueOpen((v) => !v)}
            onTrackEnded={handleNext}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />

          <QueueSidebar
            isOpen={isQueueOpen}
            onClose={() => setIsQueueOpen(false)}
            currentTrack={currentTrack}
            queue={nextSongs}
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
