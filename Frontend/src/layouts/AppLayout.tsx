import SideBar from "../components/SideBar";
import PlayerBar from "../components/PlayerBar";
import RightSideBar from "../components/RightSideBar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import AuthModal from "../components/AuthModal";
import VideoPlayerModal from "../components/VideoPlayerModal";
import QueueSidebar from "../components/QueueSidebar";
import { ChevronLeft } from "lucide-react";
import { mediaService, signalRService } from "../api";
import {
  useNotifications,
  NotificationContext,
} from "../context/NotificationContext";
import { mapMediaToSong, type SongType } from "../utils/mediaMapping";
import type { ShareItemDto } from "../types/api";
import { userService } from "../api/userService";
import { playHistoryService } from "../services/playHistoryService";

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
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  useContext(NotificationContext);

  const { addNotification, addMessage, allMessages } = useNotifications();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem("token"),
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const [songs, setSongs] = useState<SongType[]>([]);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const lastRecordedSongIdRef = useRef<string | null>(null);

  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [seekTrigger, setSeekTrigger] = useState<{ time: number } | null>(null);

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isNowPlayingSidebarOpen, setIsNowPlayingSidebarOpen] = useState(false);
  const [playlistQueue, setPlaylistQueue] = useState<SongType[]>([]);

  const canShowAppShell = isAuthenticated || isLandingPage;

  const shouldShowAuthModal =
    !isAuthenticated && (!isLandingPage || isAuthModalOpen);

  const handleSetPlaylistQueue = (_id: string, tracks: SongType[]) => {
    setPlaylistQueue(tracks);
  };

  const currentIndex = playlistQueue.findIndex((t) => t.id === currentSongId);
  const nextSongs = currentIndex !== -1 ? playlistQueue.slice(currentIndex + 1) : [];

  const currentTrack =
    songs.find((song) => song.id === currentSongId) ||
    allMessages.find((msg) => msg.trackData?.id === currentSongId)?.trackData ||
    null;

  const handleAddCurrentToQueue = () => {
    if (!currentTrack) return;

    const track = currentTrack as SongType;
    setPlaylistQueue((previous) => {
      if (previous.length === 0) return [track];

      const queue = previous.some((item) => item.id === track.id)
        ? previous
        : [track, ...previous];

      return [...queue, track];
    });
  };


  const getVideoCandidateUrl = (track: any) => {
    if (!track) return "";

    const mediaKind = (
      track.mediaType ||
      track.mimeType ||
      track.contentType ||
      ""
    )
      .toString()
      .toLowerCase()
      .trim();

    const isVideo =
      mediaKind === "video" || mediaKind.startsWith("video/");

    if (!isVideo && !track.videoUrl) return "";

    const rawVideoUrl = track.videoUrl || track.url || "";
    return typeof rawVideoUrl === "string" ? rawVideoUrl.trim() : "";
  };

  const modalVideoUrl = getVideoCandidateUrl(currentTrack);


  const handleOpenVideo = () => {
    setIsVideoOpen(true);
  };

  const handleToggleCurrentFavorite = async () => {
    if (!currentTrack) return;

    try {
      await userService.toggleFavorite(currentTrack.id);
      setSongs((previous) =>
        previous.map((song) =>
          song.id === currentTrack.id
            ? { ...song, isLiked: !song.isLiked }
            : song,
        ),
      );
    } catch {
      // The existing state remains unchanged when the request fails.
    }
  };


  const handleAuthSuccess = (_name: string) => {
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    if (location.pathname === "/") {
      navigate("/home");
    }
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
      setIsPlaying(true);
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

  useEffect(() => {
    if (songs.length === 0) return;

    const loadFavorites = async () => {
      try {
        const favorites = await userService.getFavorites();

        setSongs((prev) =>
          prev.map((song) => ({
            ...song,
            isLiked: favorites.includes(song.id)
          }))
        );
      } catch {
        // Nếu chưa đăng nhập hoặc token lỗi thì bỏ qua
      }
    };

    void loadFavorites();
  }, [songs.length]);

  useEffect(() => {
    if (!isAuthenticated || !currentSongId || !isPlaying) return;
    if (lastRecordedSongIdRef.current === currentSongId) return;

    lastRecordedSongIdRef.current = currentSongId;

    void playHistoryService.add(currentSongId).catch(() => {
      if (lastRecordedSongIdRef.current === currentSongId) {
        lastRecordedSongIdRef.current = null;
      }
    });
  }, [currentSongId, isPlaying, isAuthenticated]);

  useEffect(() => {
    if (currentSongId) {
      setIsNowPlayingSidebarOpen(true);
    }
  }, [currentSongId]);


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
    share?: ShareItemDto
  ) => {
    const currentUserId = localStorage.getItem("currentUserId") || "";
    const currentUserName =
      localStorage.getItem("currentUserName") || "Current user";

    const targetReceiverId = share?.receiverId || "";
    const targetReceiverName = share?.receiverName || receiverName;

    const newShareMessage: InboxMessageType = {
      id: share?.id || `msg_${Date.now()}`,
      senderId: share?.senderId || currentUserId,
      senderName: share?.senderName || currentUserName,
      receiverId: targetReceiverId,
      receiverName: targetReceiverName,
      avatarColor: currentUserId.includes("ross")
        ? "bg-purple-500"
        : "bg-blue-500",
      sharedType: type,
      time: share?.sharedAt || new Date().toISOString(),
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

    if (targetReceiverId === currentUserId) {
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
    }

    addMessage(newShareMessage);
  };

  const defaultPoster =
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000";

  return (
    <div className="flex h-screen flex-col bg-zinc-100 text-zinc-950 transition-colors duration-200 select-none font-sans dark:bg-zinc-950 dark:text-white">
      <AuthModal
        open={shouldShowAuthModal}
        onClose={() => {
          if (isLandingPage) {
            setIsAuthModalOpen(false);
          }
        }}
        onAuthenticated={handleAuthSuccess}
      />

      {canShowAppShell && (
        <>
          <div className="relative flex min-h-0 flex-1 gap-2 overflow-hidden p-2 pb-0">
            <SideBar
              onOpenAuth={() => {
                setIsAuthenticated(false);
                setIsAuthModalOpen(true);
              }}
            />

            <main className="min-w-0 flex-1 overflow-y-auto rounded-lg bg-white p-6 shadow-sm transition-colors duration-200 dark:bg-zinc-900 dark:shadow-none">
              <div key={location.key} className="route-enter min-h-full">
                <Outlet
                  context={
                    {
                      currentSongId,
                      setCurrentSongId,
                      isPlaying,
                      setIsPlaying,
                      songs,
                      setSongs,
                      onOpenAuth: () => setIsAuthModalOpen(true),
                      onOpenVideo: handleOpenVideo,
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
              </div>
            </main>

            <RightSideBar
              currentTrack={currentTrack}
              onOpenVideo={handleOpenVideo}
              isOpen={isNowPlayingSidebarOpen}
              onClose={() => setIsNowPlayingSidebarOpen(false)}
              onShareSuccess={handleShareSuccess}
            />

            {!isNowPlayingSidebarOpen && currentTrack && (
              <button
                type="button"
                onClick={() => setIsNowPlayingSidebarOpen(true)}
                className="absolute right-2 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-zinc-700 bg-zinc-800 text-zinc-300 shadow-lg transition hover:bg-zinc-700 hover:text-white xl:flex"
                aria-label="Mở thông tin bài hát"
                title="Mở thông tin bài hát"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}
          </div>

          <PlayerBar
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            setSongs={setSongs as any}
            volume={volume}
            setVolume={setVolume}
            onOpenVideo={handleOpenVideo}
            onTimeUpdate={(currentTime, duration) => {
              setAudioCurrentTime(currentTime);
              setAudioDuration(duration);
            }}
            seekTrigger={seekTrigger}
            onShareSuccess={handleShareSuccess}
            onToggleQueueSidebar={() => setIsQueueOpen((v) => !v)}
            onToggleNowPlayingSidebar={() => setIsNowPlayingSidebarOpen((v) => !v)}
            isNowPlayingSidebarOpen={isNowPlayingSidebarOpen}
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

      {isVideoOpen && (
        <VideoPlayerModal
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
          videoUrl={modalVideoUrl}
          posterUrl={currentTrack?.posterUrl || defaultPoster}
          title={currentTrack?.title || "Live Concert"}
          artist={currentTrack?.artist || "Luna Nova"}
          mediaId={currentTrack?.id}
          isLiked={currentTrack?.isLiked ?? false}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          volume={volume}
          setVolume={setVolume}
          audioCurrentTime={audioCurrentTime}
          audioDuration={audioDuration}
          onShareSuccess={handleShareSuccess}
          onToggleFavorite={handleToggleCurrentFavorite}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onAddCurrentToQueue={handleAddCurrentToQueue}
          onSeekAudio={(time) => setSeekTrigger({ time })}
        />
      )}
    </div>
  );
};

export default AppLayout;
