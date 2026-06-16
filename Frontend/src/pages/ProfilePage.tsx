import { useState, useRef, useEffect, useMemo } from "react";
import {
  Edit3,
  X,
  Save,
  Camera,
  Users,
  UserCheck,
  ListMusic,
  Music2,
  Play,
  Heart,
  History,
  Pause,
} from "lucide-react";
import { MOCK_USERS, MOCK_FOLLOWS } from "../data/mockData";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { musicService } from "../services/musicService";
import type { FollowType } from "../data/mockData";
import FollowModal from "../components/FollowModal";
import { useNotifications } from "../context/NotificationContext";
import { userService } from "../api/userService";


// Định nghĩa interface cho Context nhận từ AppLayout (giống bên LikedSongsPage)
interface OutletContextType {
  currentSongId: number | null;
  setCurrentSongId: (id: number | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  songs: any[];
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const currentUserId = localStorage.getItem("currentUserId") || "user-alex";
  const targetId = userId || currentUserId;
  const isMyProfile = !userId || userId === currentUserId;

  const { currentSongId, setCurrentSongId, isPlaying, setIsPlaying } =
    useOutletContext<OutletContextType>();

  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    bio: string;
    avatarUrl: string;
    [k: string]: any;
  }>({
    fullName: "Hello World",
    bio: "Music lover",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop",
  });

  // Load user profile
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isMyProfile) {
        // Public profile tạm thời từ mock
        const matchedUser = MOCK_USERS.find((u) => u.id === targetId);
        if (!matchedUser) return;
        if (cancelled) return;
        setUserProfile({
          fullName: matchedUser.name,
          bio: matchedUser.bio || "Music lover",
          avatarUrl: matchedUser.avatarUrl,
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
        const matchedUser = MOCK_USERS.find((u) => u.id === targetId);
        if (!matchedUser) return;
        setUserProfile({
          fullName: matchedUser.name,
          bio: matchedUser.bio || "Music lover",
          avatarUrl: matchedUser.avatarUrl,
        });
        setEditName(matchedUser.name);
        setEditBio(matchedUser.bio || "Music lover");
        setPreviewUrl(matchedUser.avatarUrl);
      } finally {
        if (!cancelled) setIsProfileLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [targetId, isMyProfile]);


  const publicPlaylists = musicService.getPublicPlaylists();
  const likedTracks = musicService.getLikedSongs();
  const recentlyPlayed = musicService.getRecentSongs();

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

  const handlePlayRecentSong = (songId: number) => {
    if (currentSongId === songId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSongId(songId);
      setIsPlaying(true);
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

      // update profile text fields
      await userService.updateProfile({
        id: userId,
        userName: editName,
        displayName: editName,
        bio: editBio,
      });

      // upload avatar if user selected a file
      if (selectedFile) {
        const avatarUrl = await userService.uploadAvatar(selectedFile);
        setPreviewUrl(avatarUrl);
      }

      // refresh profile from server
      const profile = await userService.getCurrentProfileMe();
      setUserProfile({
        fullName: profile.userName ?? profile.displayName ?? "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
      });
      setEditName(profile.userName ?? profile.displayName ?? "");
      setEditBio(profile.bio || "");
      setIsModalOpen(false);
    } catch (error: any) {
      setProfileError(
        error?.response?.data?.message || error?.message || "Cập nhật hồ sơ thất bại"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };


  const [follows, setFollows] = useState<FollowType[]>(() => {
    const saved = localStorage.getItem("my_follows");
    return saved ? (JSON.parse(saved) as FollowType[]) : [...MOCK_FOLLOWS];
  });

  const followersCount = useMemo(
    () => follows.filter((f) => f.followingId === targetId).length,
    [follows, targetId]
  );

  const followingCount = useMemo(
    () => follows.filter((f) => f.followerId === targetId).length,
    [follows, targetId]
  );

  const isFollowing = useMemo(
    () => follows.some((f) => f.followerId === currentUserId && f.followingId === targetId),
    [follows, currentUserId, targetId]
  );

  const currentUser = MOCK_USERS.find((u) => u.id === currentUserId) || {
    id: "unknown",
    name: "Guest",
  };

  const { addNotification } = useNotifications();

  const handleToggleFollow = () => {
    setFollows((prev) => {
      const following = prev.some(
        (f) => f.followerId === currentUserId && f.followingId === targetId
      );

      let newFollows: FollowType[];
      if (following) {
        newFollows = prev.filter(
          (f) => !(f.followerId === currentUserId && f.followingId === targetId)
        );
      } else {
        newFollows = [
          ...prev,
          { followerId: currentUserId, followingId: targetId } as any,
        ];

        addNotification({
          id: Date.now().toString(),
          receiverId: targetId,
          type: "follow",
          payload: JSON.stringify({
            senderId: currentUser.id,
            senderName: currentUser.name,
            recipientId: targetId,
          }),
          time: "Just now",
          isRead: false,
        } as any);
      }

      localStorage.setItem("my_follows", JSON.stringify(newFollows));
      return newFollows;
    });
  };

  const [followModal, setFollowModal] = useState<{
    isOpen: boolean;
    title: string;
    list: any[];
  }>({ isOpen: false, title: "", list: [] });

  const openFollowModal = (type: "followers" | "following") => {
    const usersList =
      type === "followers"
        ? follows
            .filter((f) => f.followingId === targetId)
            .map((f) => MOCK_USERS.find((u) => u.id === f.followerId))
        : follows
            .filter((f) => f.followerId === targetId)
            .map((f) => MOCK_USERS.find((u) => u.id === f.followingId));

    const filteredList = usersList.filter((u) => u !== undefined);
    setFollowModal({
      isOpen: true,
      title: type === "followers" ? "Followers" : "Following",
      list: filteredList as any[],
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
              src={userProfile.avatarUrl}
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
            Recently Played
          </button>
        </div>

        {activeTab === "public" && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xl font-bold text-white">Public Playlists</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {publicPlaylists.map((item) => (
                <article
                  key={item.id}
                  onClick={() => navigate(`/playlist/${item.id}`)}
                  className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800"
                >
                  <div className="relative mb-3">
                    <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                      {item.type === "albums" ? (
                        <Music2 className="size-10 text-zinc-400" />
                      ) : (
                        <ListMusic className="size-10 text-zinc-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer active:scale-95"
                    >
                      <Play className="size-5 fill-black text-black" />
                    </button>
                  </div>
                  <h4 className="truncate text-sm font-semibold text-white">{item.title}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{item.subtitle}</p>
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
                            <span className="text-zinc-500 font-medium">{index + 1}</span>
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
                      <span className="text-xs text-zinc-500 tabular-nums">{item.song.duration}</span>
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
                      src={previewUrl}
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

