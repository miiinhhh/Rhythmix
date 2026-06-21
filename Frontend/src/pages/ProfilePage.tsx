import { useState, useRef, useEffect } from "react";
import {
  Edit3,
  X,
  Save,
  Camera,
  Users,
  UserCheck,
  ListMusic,
  Play,
  Heart,
  History,
  Pause,
} from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import FollowModal from "../components/FollowModal";
import { useNotifications } from "../context/NotificationContext";
import { userService } from "../api/userService";
import { playlistService } from "../api/playlistService";
import { followService } from "../api/followService";
import type { ArtistDto, PlaylistDto, UserProfileDto } from "../types/api";
import type { SongType } from "../utils/mediaMapping";
import { playHistoryService } from "../services/playHistoryService";

// Định nghĩa interface cho Context nhận từ AppLayout (giống bên LikedSongsPage)
interface OutletContextType {
  currentSongId: string | null;
  setCurrentSongId: (id: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  songs: SongType[];
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
}

const API_ORIGIN = "http://localhost:5269";

const resolveAssetUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  return `${API_ORIGIN}${url}`;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const currentUserId = localStorage.getItem("currentUserId") || "";
  const targetId = userId || currentUserId;
  const isMyProfile = !userId || userId === currentUserId;

  const { currentSongId, setCurrentSongId, isPlaying, setIsPlaying, songs, setSongs } =
    useOutletContext<OutletContextType>();

  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    bio: string;
    avatarUrl: string;
    [k: string]: any;
  }>({
    fullName: "Hello World",
    bio: "Music lover",
    avatarUrl: "",
  });
  const [users, setUsers] = useState<UserProfileDto[]>([]);

  useEffect(() => {
    userService.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  // Load user profile
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isMyProfile) {
        // Public profile tạm thời từ mock
        const matchedUser = users.find((u) => u.id === targetId);
        if (!matchedUser) return;
        if (cancelled) return;
        setUserProfile({
          fullName: matchedUser.displayName || matchedUser.userName,
          bio: matchedUser.bio || "Music lover",
          avatarUrl: matchedUser.avatarUrl || "",
        });
        return;
      }

      try {
        setIsProfileLoading(true);
        const profile = await userService.getCurrentProfileMe();
        if (cancelled) return;

        setUserProfile({
          fullName: profile.userName ?? profile.displayName ?? "",
          bio: profile.bio || "",
          avatarUrl: profile.avatarUrl || "",
        });
        setEditName(profile.userName ?? profile.displayName ?? "");
        setEditBio(profile.bio || "");
        setPreviewUrl(profile.avatarUrl || "");
      } catch {
        if (cancelled) return;
        // fallback mock
        const matchedUser = users.find((u) => u.id === targetId);
        if (!matchedUser) return;
        setUserProfile({
          fullName: matchedUser.displayName || matchedUser.userName,
          bio: matchedUser.bio || "Music lover",
          avatarUrl: matchedUser.avatarUrl || "",
        });
        setEditName(matchedUser.displayName || matchedUser.userName || "");
        setEditBio(matchedUser.bio || "Music lover");
        setPreviewUrl(matchedUser.avatarUrl || "");
      } finally {
        if (!cancelled) setIsProfileLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [targetId, isMyProfile, users]);

  useEffect(() => {
    if (!isMyProfile) return;

    let cancelled = false;

    const loadLikedTracks = async () => {
      try {
        const likedIds = await userService.getFavorites();

        if (cancelled) return;

        setLikedTrackIds(likedIds);

        setSongs((prev) =>
          prev.map((song) => ({
            ...song,
            isLiked: likedIds.includes(song.id),
          }))
        );
      } catch (error) {
        console.error("Load liked tracks failed:", error);

        if (!cancelled) {
          setLikedTrackIds([]);
        }
      }
    };

    void loadLikedTracks();

    return () => {
      cancelled = true;
    };
  }, [isMyProfile, setSongs]);


  const [publicPlaylists, setPublicPlaylists] = useState<PlaylistDto[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const likedTracks = songs.filter((song) => likedTrackIds.includes(song.id));
  const maxHistoryCount = 10;
  const [recentlyPlayed, setRecentlyPlayed] = useState<
    { song: SongType; playedAt: Date }[]
  >([]);
  useEffect(() => {
    if (!isMyProfile) return;
    if (songs.length === 0) return;

    const loadPlayHistories = async () => {
      try {
        const histories = await playHistoryService.getMyHistories(maxHistoryCount);

        const mapped = histories
          .map((item) => {
            const song = songs.find((s) => s.id === item.mediaId);

            if (!song) return null;

            return {
              song,
              playedAt: new Date(item.playedAt),
            };
          })
          .filter(Boolean) as { song: SongType; playedAt: Date }[];

        setRecentlyPlayed(mapped);
      } catch {
        setRecentlyPlayed([]);
      }
    };

    void loadPlayHistories();
  }, [isMyProfile, songs]);
  useEffect(() => {
    if (!isMyProfile) return;
    if (!currentSongId || !isPlaying) return;

    const song = songs.find((item) => item.id === currentSongId);
    if (!song) return;

    const savePlayHistory = async () => {
      try {
        await playHistoryService.add(currentSongId);

        setRecentlyPlayed((prev) => {
          const next = [
            {
              song,
              playedAt: new Date(),
            },
            ...prev.filter((item) => item.song.id !== song.id),
          ].slice(0, maxHistoryCount);

          return next;
        });
      } catch {
        // Không chặn nghe nhạc nếu lưu lịch sử bị lỗi
      }
    };

    void savePlayHistory();
  }, [currentSongId, isPlaying, songs, isMyProfile]);

  useEffect(() => {
    playlistService
      .getPublic()
      .then((items) =>
        setPublicPlaylists(targetId ? items.filter((item) => item.ownerId === targetId) : items)
      )
      .catch(() => setPublicPlaylists([]));
  }, [targetId]);

  const formatPlayedTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    return date.toLocaleDateString();
  };

  const handlePlayRecentSong = (songId: string) => {
    if (currentSongId === songId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSongId(songId);
      setIsPlaying(true);
    }
  };
  const handleToggleLikeRecentSong = async (
    e: React.MouseEvent<HTMLButtonElement>,
    songId: string
  ) => {
    e.stopPropagation();

    try {
      await userService.toggleFavorite(songId);

      setSongs((prev) =>
        prev.map((song) =>
          song.id === songId
            ? { ...song, isLiked: !song.isLiked }
            : song
        )
      );

      setRecentlyPlayed((prev) =>
        prev.map((item) =>
          item.song.id === songId
            ? {
                ...item,
                song: {
                  ...item.song,
                  isLiked: !item.song.isLiked,
                },
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const [activeTab, setActiveTab] = useState<"public" | "liked" | "recent">("public");

  // State quản lý Modal và form nhập liệu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [editName, setEditName] = useState(userProfile.fullName);
  const [editBio, setEditBio] = useState(userProfile.bio);

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const isSaveDisabled = isSavingProfile || isProfileLoading || !userProfile.fullName;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(userProfile.avatarUrl || "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSavingProfile(true);
      setProfileError("");

      const userId = localStorage.getItem("currentUserId") || "";

      let avatarUrl = userProfile.avatarUrl;
      if (selectedFile) {
        avatarUrl = await userService.uploadAvatar(selectedFile);
        setPreviewUrl(avatarUrl);
      }

      await userService.updateProfile({
        id: userId,
        userName: editName,
        displayName: editName,
        bio: editBio,
        avatarUrl,
      });

      // refresh profile from server
      const profile = await userService.getCurrentProfileMe();
      setUserProfile({
        fullName: profile.userName ?? profile.displayName ?? "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
      });
      setEditName(profile.userName ?? profile.displayName ?? "");
      setEditBio(profile.bio || "");
      setSelectedFile(null);
      setIsModalOpen(false);
    } catch (error: any) {
      setProfileError(
        error?.response?.data?.message || error?.message || "Cập nhật hồ sơ thất bại"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };


  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<UserProfileDto[]>([]);
  const [followingList, setFollowingList] = useState<UserProfileDto[]>([]);
  const [followingArtists, setFollowingArtists] = useState<ArtistDto[]>([]);
  const [isFollowBusy, setIsFollowBusy] = useState(false);

  const refreshFollowData = async () => {
    const [counts, followers, following, artists, status] = await Promise.all([
      followService.getUserCounts(targetId),
      followService.getFollowers(targetId),
      followService.getFollowing(targetId),
      followService.getFollowingArtistsByUser(targetId),
      isMyProfile ? Promise.resolve(false) : followService.isFollowing(targetId),
    ]);

    setFollowersCount(counts.followersCount);
    setFollowingCount(counts.followingCount + (artists?.length ?? 0));
    setFollowersList(followers || []);
    setFollowingList(following || []);
    setFollowingArtists(artists || []);
    setIsFollowing(status);
  };

  useEffect(() => {
    if (!targetId) return;

    let cancelled = false;
    const loadFollowData = async () => {
      try {
        const [counts, followers, following, artists, status] = await Promise.all([
          followService.getUserCounts(targetId),
          followService.getFollowers(targetId),
          followService.getFollowing(targetId),
          followService.getFollowingArtistsByUser(targetId),
          isMyProfile ? Promise.resolve(false) : followService.isFollowing(targetId),
        ]);
        if (cancelled) return;
        setFollowersCount(counts.followersCount);
        setFollowingCount(counts.followingCount + (artists?.length ?? 0));
        setFollowersList(followers || []);
        setFollowingList(following || []);
        setFollowingArtists(artists || []);
        setIsFollowing(status);
      } catch {
        if (cancelled) return;
        setFollowersCount(0);
        setFollowingCount(0);
        setFollowersList([]);
        setFollowingList([]);
        setFollowingArtists([]);
        setIsFollowing(false);
      }
    };

    void loadFollowData();
    return () => {
      cancelled = true;
    };
  }, [targetId, isMyProfile]);

  const currentUser = users.find((u) => u.id === currentUserId) || {
    id: "unknown",
    userName: "Guest",
    displayName: "Guest",
    email: "",
  };

  const { addNotification } = useNotifications();

  const handleToggleFollow = async () => {
    if (isFollowBusy || !targetId || isMyProfile) return;

    const previous = isFollowing;
    setIsFollowBusy(true);
    setIsFollowing(!previous);
    setFollowersCount((count) => Math.max(0, count + (previous ? -1 : 1)));

    try {
      const result = await followService.toggleUser(targetId);
      const message = result?.message ?? result?.Message ?? "";
      const next = result?.isFollowing ?? result?.IsFollowing ?? !message.toLowerCase().includes("unfollow");
      setIsFollowing(next);

      if (next !== !previous) {
        setFollowersCount((count) => Math.max(0, count + (next ? 1 : -1)));
      }

      if (next) {
        addNotification({
          id: Date.now().toString(),
          receiverId: targetId,
          type: "follow",
          payload: JSON.stringify({
            senderId: currentUser.id,
            senderName: currentUser.displayName || currentUser.userName,
            recipientId: targetId,
          }),
          time: "Just now",
          isRead: false,
        } as any);
      }

      await refreshFollowData();
    } catch {
      setIsFollowing(previous);
      setFollowersCount((count) => Math.max(0, count + (previous ? 1 : -1)));
    } finally {
      setIsFollowBusy(false);
    }
  };

  const [followModal, setFollowModal] = useState<{
    isOpen: boolean;
    title: string;
    list: any[];
  }>({ isOpen: false, title: "", list: [] });

  const openFollowModal = (type: "followers" | "following") => {
    setFollowModal({
      isOpen: true,
      title: type === "followers" ? "Followers" : "Following",
      list:
        type === "followers"
          ? followersList
          : [
              ...followingList.map((item) => ({ ...item, itemType: "user" })),
              ...followingArtists.map((item) => ({ ...item, itemType: "artist" })),
            ],
    });
  };

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Profile
        </h1>

        <p className="mt-2 text-sm font-medium text-zinc-400">
          Manage your public profile and social connections.
        </p>
      </div>

      <div className="flex max-w-4xl flex-col items-center gap-6 rounded-xl border border-zinc-800 bg-[#121212] p-6 shadow-sm sm:flex-row sm:items-start">
        <div className="relative size-32 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 shadow-2xl">
          {userProfile.avatarUrl ? (
            <img
              src={resolveAssetUrl(userProfile.avatarUrl)}
              alt="Avatar"
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-emerald-500 flex items-center justify-center text-3xl font-black text-black">
              {userProfile.fullName?.charAt(0)?.toUpperCase() || "G"}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 pt-2 text-center sm:text-left">
          <h2 className="text-2xl font-black tracking-tight text-white">{userProfile.fullName}</h2>

          <p className="text-sm text-zinc-400 font-medium max-w-xl leading-relaxed">
            {userProfile.bio || "No bio added yet."}
          </p>

          <div className="flex items-center justify-center gap-4 pt-1 text-xs font-bold text-zinc-300 sm:justify-start">
            <div
              onClick={() => openFollowModal("followers")}
              className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-green-500"
            >
              <Users className="size-3.5 text-zinc-400" />
              <span>
                {followersCount} <span className="font-normal text-zinc-500">followers</span>
              </span>
            </div>
            <span className="text-zinc-700">•</span>
            <div
              onClick={() => openFollowModal("following")}
              className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-green-500"
            >
              <UserCheck className="size-3.5 text-zinc-400" />
              <span>
                {followingCount} <span className="font-normal text-zinc-500">following</span>
              </span>
            </div>
          </div>

          <div className="pt-2">
            {isMyProfile ? (
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setProfileError("");
                  setEditName(userProfile.fullName);
                  setEditBio(userProfile.bio);
                  setPreviewUrl(userProfile.avatarUrl);
                  setSelectedFile(null);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-800"
              >
                <Edit3 className="size-3" /> Chỉnh sửa hồ sơ
              </button>
            ) : (
              <button
                onClick={handleToggleFollow}
                disabled={isFollowBusy}
                className={`px-6 py-2 rounded-full text-xs font-bold ${
                  isFollowing ? "bg-zinc-800 text-white" : "bg-white text-black"
                }`}
              >
                {isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("public")}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "public"
                ? "bg-white text-black"
                : "border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            Public Playlists
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("liked")}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "liked"
                ? "bg-white text-black"
                : "border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            Liked
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "recent"
                ? "bg-white text-black"
                : "border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            Play History
          </button>
        </div>

        {activeTab === "public" && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xl font-bold text-white">Public Playlists</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {publicPlaylists.map((item) => (
                <article
                  key={item.playlistId}
                  onClick={() => navigate(`/playlist/${item.playlistId}`)}
                  className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800"
                >
                  <div className="relative mb-3">
                    <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                      <ListMusic className="size-10 text-zinc-400" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer active:scale-95"
                    >
                      <Play className="size-5 fill-black text-black" />
                    </button>
                  </div>
                  <h4 className="truncate text-sm font-semibold text-white">{item.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{item.description || "Public playlist"}</p>
                </article>
              ))}
            </div>

            {publicPlaylists.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-10 text-center">
                <p className="text-sm text-zinc-500">No public playlists to show.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Heart className="size-5 text-green-500 fill-green-500" />
              <h3 className="text-xl font-bold text-white">Liked Songs</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <article
                onClick={() => navigate("/liked")}
                className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800 w-full"
              >
                <div className="relative mb-3">
                  <div className="flex aspect-square w-full items-center justify-center bg-zinc-800 shadow-lg rounded-full">
                    <Heart className="size-10 text-green-500 fill-green-500" />
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <Play className="size-5 fill-black text-black" />
                  </button>
                </div>
                <h4 className="truncate text-sm font-semibold text-white">Liked Songs</h4>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">Playlist • {likedTracks.length} songs</p>
              </article>
            </div>
          </div>
        )}

        {activeTab === "recent" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <History className="size-5 text-green-500" />
              <h3 className="text-xl font-bold text-white">Recently Played</h3>
            </div>

            <div className="space-y-2">
              {recentlyPlayed.map((item: any, index: number) => {
                const isCurrentSong = currentSongId === item.song.id;
                return (
                  <div
                    key={`${item.song.id}-${index}`}
                    onClick={() => handlePlayRecentSong(item.song.id)}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 hover:bg-zinc-800/40 cursor-pointer transition-colors group select-none"
                  >
                    <div className="min-w-0 flex-1 grid grid-cols-12 items-center gap-4">
                      <div className="col-span-1 flex items-center justify-center w-8 h-8 text-xs font-medium text-zinc-400">
                        <div className="group-hover:hidden flex items-center justify-center">
                          {isCurrentSong ? (
                            isPlaying ? (
                              <div className="flex items-end justify-center gap-[3px] h-3.5 w-5 mx-auto">
                                <span className="w-[3px] bg-green-500 rounded-full animate-[bounce_0.8s_infinite_100ms] h-2"></span>
                                <span className="w-[3px] bg-green-500 rounded-full animate-[bounce_0.8s_infinite_300ms] h-3.5"></span>
                                <span className="w-[3px] bg-green-500 rounded-full animate-[bounce_0.8s_infinite_0s] h-1.5"></span>
                                <span className="w-[3px] bg-green-500 rounded-full animate-[bounce_0.8s_infinite_200ms] h-2.5"></span>
                              </div>
                            ) : (
                              <div className="flex items-end justify-center gap-[3px] h-3.5 w-5 mx-auto">
                                <span className="w-[3px] h-2 bg-green-500 rounded-full"></span>
                                <span className="w-[3px] h-3.5 bg-green-500 rounded-full"></span>
                                <span className="w-[3px] h-1.5 bg-green-500 rounded-full"></span>
                                <span className="w-[3px] h-2.5 bg-green-500 rounded-full"></span>
                              </div>
                            )
                          ) : (
                            <span className="text-zinc-500 font-medium">{index + 1}/{maxHistoryCount}</span>
                          )}
                        </div>

                        <div className="hidden group-hover:flex items-center justify-center">
                          {isCurrentSong && isPlaying ? (
                            <Pause className="size-4 text-green-500 fill-green-500" />
                          ) : isCurrentSong && !isPlaying ? (
                            <Play className="size-4 text-green-500 fill-green-500" />
                          ) : (
                            <Play className="size-4 text-white fill-white" />
                          )}
                        </div>
                      </div>

                      <div className="col-span-7 min-w-0">
                        <div
                          className={`truncate text-sm font-semibold transition-colors ${
                            isCurrentSong ? "text-green-500" : "text-white"
                          }`}
                        >
                          {item.song.title}
                        </div>
                        <div className="truncate text-xs text-zinc-400 mt-0.5">
                          {item.song.artist} • {item.song.album}
                        </div>
                      </div>

                      <div className="col-span-4 text-xs text-zinc-500 text-right pr-4 tabular-nums">
                        {formatPlayedTime(item.playedAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleLikeRecentSong(e, item.song.id)}
                        className="ml-2 text-zinc-400 transition-colors hover:text-white cursor-pointer"
                        aria-label={item.song.isLiked ? "Unlike" : "Like"}
                      >
                        <Heart
                          className={`size-4 transition-all duration-200 ${
                            item.song.isLiked
                              ? "text-green-500 fill-green-500 scale-110"
                              : ""
                          }`}
                        />
                      </button>

                      <span className="text-xs text-zinc-500 tabular-nums">
                        {item.song.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {recentlyPlayed.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-10 text-center">
                <p className="text-sm text-zinc-500">No recent plays yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-5 rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Chỉnh sửa hồ sơ cá nhân</h3>
              <button
                onClick={() => {
                  setProfileError("");
                  setIsModalOpen(false);
                }}
                className="cursor-pointer text-zinc-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative size-24 cursor-pointer overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 shadow-md"
                >
                  {previewUrl ? (
                    <img
                      src={resolveAssetUrl(previewUrl)}
                      alt="Preview"
                      className="size-full object-cover transition-opacity group-hover:opacity-40"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-zinc-500 font-bold">No Image</div>
                  )}

                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="size-4 mb-1" />
                    <span>Thay đổi ảnh</span>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer text-xs font-semibold text-green-500 hover:underline"
                >
                  Chọn ảnh từ máy tính
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-transparent bg-zinc-800 p-2.5 text-sm text-white transition-colors focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Tiểu sử (Bio)
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Giới thiệu ngắn về bạn..."
                  className="w-full resize-none rounded-md border border-transparent bg-zinc-800 p-2.5 text-sm text-white transition-colors focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-2">
                {profileError && (
                  <p className="mr-auto max-w-56 text-xs font-medium text-red-400">{profileError}</p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setProfileError("");
                    setIsModalOpen(false);
                  }}
                  className="cursor-pointer px-4 py-2 text-xs font-bold text-white hover:underline"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isSaveDisabled}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black transition-transform hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="size-3.5" /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FollowModal
        isOpen={followModal.isOpen}
        onClose={() => setFollowModal({ ...followModal, isOpen: false })}
        title={followModal.title}
        list={followModal.list}
      />
    </div>
  );
};

export default ProfilePage;

