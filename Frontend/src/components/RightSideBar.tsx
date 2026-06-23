import {
  MoreHorizontal,
  Music2,
  Plus,
  Share2,
  Maximize2,
  X,
  Check,
  ListPlus,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { artistService } from "../api/artistService";
import { followService } from "../api/followService";
import { playlistService } from "../api/playlistService";
import type { ArtistDto, PlaylistDto, ShareItemDto } from "../types/api";
import { resolveAssetUrl, type SongType } from "../utils/mediaMapping";
import ShareModal from "./ShareModal";
import CreatePlaylistModal from "./CreatePlaylistModal";

interface RightSideBarProps {
  currentTrack: SongType | null;
  onOpenVideo?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: (
    type: "song" | "video",
    track: SongType,
    receiverName: string,
    share: ShareItemDto,
  ) => void;
}

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000";

const getFakeMonthlyListeners = (track: SongType) => {
  const seed = track.id
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  const listeners = 120000 + (seed % 900) * 1000;

  return new Intl.NumberFormat("en-US").format(listeners);
};

const RightSideBar = ({
  currentTrack,
  onOpenVideo,
  isOpen,
  onClose,
  onShareSuccess,
}: RightSideBarProps) => {
  const [artist, setArtist] = useState<ArtistDto | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPlaylistPickerOpen, setIsPlaylistPickerOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [addingPlaylistId, setAddingPlaylistId] = useState<string | null>(null);
  const [playlistError, setPlaylistError] = useState("");
  const [playlistSuccess, setPlaylistSuccess] = useState("");
  const coverUrl = currentTrack?.posterUrl || FALLBACK_COVER;
  const artistImageUrl = resolveAssetUrl(
    artist?.coverImageUrl || artist?.avatarUrl,
  );

  const isVideoTrack =
    currentTrack?.mediaType?.toLowerCase() === "video" ||
    Boolean(currentTrack?.videoUrl);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = FALLBACK_COVER;
  };

  useEffect(() => {
    let cancelled = false;

    const loadArtist = async () => {
      if (!currentTrack?.artistId) {
        if (!cancelled) setArtist(null);
        return;
      }

      try {
        const result = await artistService.getById(currentTrack.artistId);
        if (!cancelled) setArtist(result);
      } catch {
        if (!cancelled) setArtist(null);
      }
    };

    void loadArtist();
    return () => {
      cancelled = true;
    };
  }, [currentTrack?.artistId]);

  useEffect(() => {
    let cancelled = false;

    const loadFollowStatus = async () => {
      if (!currentTrack?.artistId) {
        setIsFollowing(false);
        return;
      }

      try {
        const result = await followService.isFollowingArtist(currentTrack.artistId);
        if (!cancelled) setIsFollowing(result);
      } catch {
        if (!cancelled) setIsFollowing(false);
      }
    };

    void loadFollowStatus();
    return () => {
      cancelled = true;
    };
  }, [currentTrack?.artistId]);

  const loadPlaylists = async () => {
    setIsLoadingPlaylists(true);
    setPlaylistError("");

    try {
      setPlaylists(await playlistService.getAll());
    } catch {
      setPlaylists([]);
      setPlaylistError("Không thể tải danh sách playlist.");
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const openPlaylistPicker = () => {
    setPlaylistSuccess("");
    setIsPlaylistPickerOpen(true);
    void loadPlaylists();
  };

  const addCurrentTrackToPlaylist = async (playlist: PlaylistDto) => {
    if (!currentTrack) return;

    setAddingPlaylistId(playlist.playlistId);
    setPlaylistError("");

    try {
      await playlistService.addTrack(
        playlist.playlistId,
        currentTrack.id,
        playlist.trackCount ?? 0,
      );
      setPlaylistSuccess(`Đã thêm vào ${playlist.name}.`);
      setIsPlaylistPickerOpen(false);
    } catch (error: any) {
      setPlaylistError(
        error?.response?.data?.message || "Không thể thêm bài hát vào playlist.",
      );
    } finally {
      setAddingPlaylistId(null);
    }
  };

  const handlePlaylistCreated = async (playlist: PlaylistDto) => {
    setIsCreatePlaylistOpen(false);
    await addCurrentTrackToPlaylist(playlist);
  };

  const toggleFollow = async () => {
    if (!currentTrack?.artistId || isFollowLoading) return;

    const previous = isFollowing;
    setIsFollowing(!previous);
    setIsFollowLoading(true);

    try {
      const result = await followService.toggleArtist(currentTrack.artistId);
      setIsFollowing(result?.isFollowing ?? result?.IsFollowing ?? !previous);
    } catch {
      setIsFollowing(previous);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <aside
      className={`absolute bottom-0 right-2 top-2 z-30 hidden w-[360px] overflow-y-auto rounded-lg bg-white text-zinc-950 shadow-2xl transition-[transform,opacity] duration-300 ease-out will-change-transform dark:bg-zinc-900 dark:text-white xl:block ${
        isOpen
        ? "translate-x-0 opacity-100"
        : "pointer-events-none translate-x-[calc(100%+1rem)] opacity-0"
        }`}
      aria-hidden={!isOpen}
    >
      <div className="space-y-5 p-4">
        {!currentTrack ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-center">
            <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-zinc-800">
              <Music2 className="size-9 text-zinc-500" />
            </div>

            <h2 className="text-lg font-bold text-white">
              Chưa có bài hát đang phát
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Chọn một bài hát để xem thông tin bài hát, nghệ sĩ và Now Playing
              View tại đây.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="truncate text-base font-bold">
                {currentTrack.title}
              </h2>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  aria-label="More options"
                  title="Tùy chọn khác"
                >
                  <MoreHorizontal className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  aria-label="Đóng thông tin bài hát"
                  title="Đóng thông tin bài hát"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Big cover */}
            <div className="overflow-hidden rounded-2xl bg-zinc-800 shadow-lg">
              <img
                src={coverUrl}
                alt={currentTrack.title}
                onError={handleImageError}
                className="aspect-square w-full object-cover"
              />
            </div>

            {/* Track info */}
            <section className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold leading-tight text-white">
                    {currentTrack.title}
                  </h1>

                  <p className="mt-1 truncate text-sm font-medium text-zinc-400 hover:text-white hover:underline">
                    {currentTrack.artist}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    aria-label="Chia sẻ bài hát"
                    title="Chia sẻ bài hát"
                  >
                    <Share2 className="size-5" />
                  </button>

                  <button
                    type="button"
                    onClick={openPlaylistPicker}
                    className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    aria-label="Thêm vào playlist"
                    title="Thêm vào playlist"
                  >
                    <Plus className="size-5" />
                  </button>

                  <button
                    type="button"
                    className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    aria-label="More"
                  >
                    <MoreHorizontal className="size-5" />
                  </button>
                </div>
              </div>

              {isVideoTrack && onOpenVideo && (
                <button
                  type="button"
                  onClick={onOpenVideo}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:scale-[1.02] hover:bg-zinc-200"
                >
                  <Maximize2 className="size-4" />
                  Open video
                </button>
              )}
            </section>

            {/* About artist */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">
                About the artist
              </h3>

              <section className="overflow-hidden rounded-2xl bg-transparent">
                <div className="h-44 overflow-hidden rounded-2xl">
                  {artistImageUrl ? (
                    <img
                      src={artistImageUrl}
                      alt={currentTrack.artist}
                      onError={handleImageError}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-700">
                      <Music2 className="size-12 text-zinc-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4">
                  <p className="text-xl font-bold text-white">
                    {currentTrack.artist}
                  </p>

                  <p className="text-sm font-semibold text-white">
                    {getFakeMonthlyListeners(currentTrack)} monthly listeners
                  </p>

                  <p className="text-sm leading-6 text-zinc-300">
                    {currentTrack.artist} là nghệ sĩ đứng sau bản nhạc{" "}
                    <span className="font-medium text-white">
                      {currentTrack.title}
                    </span>
                    . Bài hát mang màu sắc hiện đại, phù hợp để nghe khi thư giãn,
                    học tập hoặc tận hưởng không gian âm nhạc của Rhythmix.
                  </p>

                  <button
                    type="button"
                    disabled={!currentTrack.artistId || isFollowLoading}
                    onClick={() => void toggleFollow()}
                    title={currentTrack.artistId ? "Theo dõi nghệ sĩ" : "Bài hát chưa có nghệ sĩ"}
                  className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                    isFollowing
                        ? "border-green-500 bg-green-500 text-black hover:bg-green-400"
                        : "border-zinc-500 text-white hover:border-white"
                      } ${!currentTrack.artistId || isFollowLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  >
                    {isFollowLoading ? "Đang xử lý" : isFollowing ? "Đang theo dõi" : "Theo dõi"}
                  </button>
                </div>
              </section>
            </div>

            {/* Small info card */}
            <section className="rounded-2xl bg-zinc-800/70 p-4">
              <h3 className="mb-3 text-base font-bold">Credits</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-white">
                    {currentTrack.artist}
                  </p>
                  <p className="text-zinc-400">Main artist</p>
                </div>

                <div>
                  <p className="font-medium text-white">
                    {currentTrack.album || "Single"}
                  </p>
                  <p className="text-zinc-400">Album</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {createPortal(
        <>
          {currentTrack && (
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              itemToShare={{
                type: isVideoTrack ? "video" : "song",
                id: currentTrack.id,
                title: currentTrack.title,
                subtitle: currentTrack.artist,
              }}
              onShareSuccess={(receiverName, share) => {
                onShareSuccess?.(
                  isVideoTrack ? "video" : "song",
                  currentTrack,
                  receiverName,
                  share,
                );
              }}
            />
          )}

          {isPlaylistPickerOpen && currentTrack && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Thêm vào playlist</h3>
                    <p className="mt-1 max-w-[280px] truncate text-xs text-zinc-400">{currentTrack.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlaylistPickerOpen(false)}
                    className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    aria-label="Đóng"
                    title="Đóng"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {playlistError && (
                  <p className="mt-3 rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
                    {playlistError}
                  </p>
                )}

                <div className="custom-scrollbar mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {isLoadingPlaylists ? (
                    <div className="flex justify-center py-8 text-zinc-400">
                      <LoaderCircle className="size-5 animate-spin" />
                    </div>
                  ) : playlists.length > 0 ? (
                    playlists.map((playlist) => {
                      const playlistCover = resolveAssetUrl(playlist.coverImageUrl || playlist.thumbnailUrl);
                      const isAdding = addingPlaylistId === playlist.playlistId;

                      return (
                        <button
                          key={playlist.playlistId}
                          type="button"
                          disabled={Boolean(addingPlaylistId)}
                          onClick={() => void addCurrentTrackToPlaylist(playlist)}
                          className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60"
                        >
                          {playlistCover ? (
                            <img src={playlistCover} alt="" className="size-11 rounded object-cover" />
                          ) : (
                            <div className="flex size-11 items-center justify-center rounded bg-zinc-800">
                              <ListPlus className="size-5 text-zinc-400" />
                            </div>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-white">{playlist.name}</span>
                            <span className="block text-xs text-zinc-400">{playlist.trackCount ?? 0} bài hát</span>
                          </span>
                          {isAdding ? <LoaderCircle className="size-4 animate-spin text-zinc-400" /> : <ListPlus className="size-4 text-zinc-400" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="py-5 text-center text-sm text-zinc-500">Bạn chưa có playlist nào.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaylistPickerOpen(false);
                    setIsCreatePlaylistOpen(true);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200"
                >
                  <ListPlus className="size-4" /> Tạo playlist mới
                </button>
              </div>
            </div>
          )}

          <CreatePlaylistModal
            isOpen={isCreatePlaylistOpen}
            onClose={() => setIsCreatePlaylistOpen(false)}
            onPlaylistCreated={handlePlaylistCreated}
          />

          {playlistSuccess && (
            <div className="fixed bottom-24 right-4 z-[110] flex items-center gap-2 rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-black shadow-lg">
              <Check className="size-4" />
              {playlistSuccess}
            </div>
          )}
        </>,
        document.body,
      )}
    </aside>
  );
};

export default RightSideBar;
