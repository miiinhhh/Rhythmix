import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Globe,
  ListMusic,
  Lock,
  Pause,
  Pencil,
  Play,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import AddSongModal from "../components/AddSongModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ShareModal from "../components/ShareModal";
import { playlistService } from "../api/playlistService";
import { mediaService } from "../api/mediaService";
import type { PlaylistDetailDto, PlaylistTrackDto } from "../types/api";
import UpdatePlaylistModal from "../components/UpdatePlaylistModal";
import { resolveArtistName, type SongType } from "../utils/mediaMapping";

interface OutletContextType {
  currentSongId: string | null;
  setCurrentSongId: (id: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  songs: SongType[];
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
  onShareSuccess: (
    type: "song" | "video" | "playlist",
    itemInfo: any,
    receiverName: string,
  ) => void;
  onSetPlaylistQueue?: (playlistId: string, tracks: SongType[]) => void;
}

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const mapTrackToSong = (track: PlaylistTrackDto): SongType => ({
  id: track.mediaId,
  title: track.title,
  artist: resolveArtistName(track.artistName, undefined, track.title),
  album: "Playlist",
  duration: formatDuration(track.duration),
  isLiked: false,
  url: mediaService.getMediaStream(track.mediaId),
  posterUrl: track.thumbnailUrl,
  mediaType: "audio",
});

const PlaylistDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    currentSongId,
    setCurrentSongId,
    isPlaying,
    setIsPlaying,
    songs,
    setSongs,
    onShareSuccess,
    onSetPlaylistQueue,
  } = useOutletContext<OutletContextType>();

  const [playlistInfo, setPlaylistInfo] = useState<PlaylistDetailDto | null>(
    null,
  );
  const [playlistSongs, setPlaylistSongs] = useState<SongType[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongType | null>(null);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletePlaylistModalOpen, setIsDeletePlaylistModalOpen] =
    useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatePlaylistModalOpen, setIsUpdatePlaylistModalOpen] =
    useState(false);

  const loadPlaylist = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const playlist = await playlistService.getById(id);
      const mappedTracks = playlist.tracks.map(mapTrackToSong);
      setPlaylistInfo(playlist);
      setPlaylistSongs(mappedTracks);
      onSetPlaylistQueue?.(id, mappedTracks);
      setSongs((prev) => {
        const existingIds = new Set(prev.map((song) => song.id));
        return [
          ...prev,
          ...mappedTracks.filter((song) => !existingIds.has(song.id)),
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist().catch(() => {
      setPlaylistInfo(null);
      setPlaylistSongs([]);
      setIsLoading(false);
    });
  }, [id]);

  const handlePlaySong = (songId: string) => {
    if (currentSongId === songId) {
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentSongId(songId);
    setIsPlaying(true);
  };

  const handleTogglePlaylist = () => {
    if (!currentSongId && playlistSongs.length > 0) {
      setCurrentSongId(playlistSongs[0].id);
      setIsPlaying(true);
      return;
    }

    setIsPlaying(!isPlaying);
  };

  const handleAddSong = async (song: SongType) => {
    if (!id) return;
    await playlistService.addTrack(id, song.id, playlistSongs.length);
    setPlaylistSongs((prev) => [...prev, song]);
    setIsAddSongModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!id || !selectedSong) return;
    await playlistService.removeMedia(id, selectedSong.id);
    setPlaylistSongs((prev) =>
      prev.filter((song) => song.id !== selectedSong.id),
    );
    if (selectedSong.id === currentSongId) {
      setCurrentSongId(null);
      setIsPlaying(false);
    }
    setIsDeleteOpen(false);
    setSelectedSong(null);
  };

  const handleDeletePlaylist = async () => {
    if (!playlistInfo) return;
    await playlistService.delete(playlistInfo.playlistId);
    setIsDeletePlaylistModalOpen(false);
    navigate("/library");
  };

  if (isLoading) {
    return <div className="p-6 text-zinc-400">Loading playlist...</div>;
  }

  if (!playlistInfo) {
    return (
      <div className="flex min-h-screen grow flex-col items-center justify-center bg-zinc-900 p-6 text-center text-zinc-400">
        <h2 className="mb-2 text-2xl font-bold text-white">
          Playlist không tồn tại
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 font-semibold text-green-500 hover:underline"
        >
          Quay lại trang trước
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen grow bg-zinc-900 p-6 text-white">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center justify-center rounded-full bg-zinc-800 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-zinc-700 active:scale-95"
      >
        <ArrowLeft className="mr-1.5 size-4" /> Back
      </button>

      <div className="mb-8 flex items-end gap-6">
        <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-lg bg-zinc-800 shadow-2xl">
          <ListMusic className="size-16 text-zinc-400" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Playlist
          </span>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-5xl font-black tracking-tight lg:text-6xl">
              {playlistInfo.name}
            </h1>
            <div title={playlistInfo.isPublic ? "Công khai" : "Riêng tư"}>
              {playlistInfo.isPublic ? (
                <Globe size={24} className="text-green-500" />
              ) : (
                <Lock size={24} className="text-zinc-400" />
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {playlistInfo.description}
          </p>
        </div>
      </div>

      <div className="mb-8 flex w-full items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            onClick={handleTogglePlaylist}
            className="rounded-full bg-green-500 p-4 text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause fill="black" size={24} />
            ) : (
              <Play fill="black" size={24} />
            )}
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-1 text-zinc-400 transition-colors hover:text-white"
          >
            <Share2 size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddSongModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-semibold text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-700 hover:text-white"
          >
            <Plus className="size-4 stroke-[3px]" /> Add Song
          </button>
          <button
            onClick={() => setIsUpdatePlaylistModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 px-4 py-2 text-sm font-semibold transition-all cursor-pointer"
          >
            <Pencil className="size-4 stroke-[3px]" /> Update Playlist
          </button>
          <button
            onClick={() => setIsDeletePlaylistModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-semibold text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-700 hover:text-white"
          >
            <Trash2 className="size-4" /> Delete Playlist
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {playlistSongs.map((song) => {
          const isCurrent = song.id === currentSongId;
          return (
            <div
              key={song.id}
              onDoubleClick={() => handlePlaySong(song.id)}
              className="grid grid-cols-[40px_1fr_120px_40px] items-center gap-4 rounded-md px-4 py-3 transition-colors hover:bg-zinc-800/60"
            >
              <button
                onClick={() => handlePlaySong(song.id)}
                className="text-zinc-400 hover:text-white"
              >
                {isCurrent && isPlaying ? (
                  <Pause size={16} fill="white" />
                ) : (
                  <Play size={16} fill="white" />
                )}
              </button>
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-semibold ${isCurrent ? "text-green-500" : "text-white"}`}
                >
                  {song.title}
                </p>
                <p className="truncate text-xs text-zinc-400">{song.artist}</p>
              </div>
              <span className="text-sm text-zinc-400">{song.duration}</span>
              <button
                onClick={() => {
                  setSelectedSong(song);
                  setIsDeleteOpen(true);
                }}
                className="text-zinc-500 hover:text-white"
                aria-label={`Remove ${song.title}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {playlistSongs.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-400">
          Playlist này chưa có bài hát nào
        </div>
      )}

      <AddSongModal
        isOpen={isAddSongModalOpen}
        onClose={() => setIsAddSongModalOpen(false)}
        allSongs={songs}
        currentPlaylistSongs={playlistSongs}
        onAddSongSuccess={handleAddSong}
      />

      <ConfirmDeleteModal
        type="song"
        itemTitle={selectedSong?.title || ""}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDeleteModal
        type="playlist"
        itemTitle={playlistInfo.name}
        isOpen={isDeletePlaylistModalOpen}
        onClose={() => setIsDeletePlaylistModalOpen(false)}
        onConfirm={handleDeletePlaylist}
      />

      <UpdatePlaylistModal
        isOpen={isUpdatePlaylistModalOpen}
        onClose={() => setIsUpdatePlaylistModalOpen(false)}
        playlistData={playlistInfo}
        onUpdateSuccess={(updatedData) => {
          playlistService
            .update(playlistInfo.playlistId, updatedData)
            .then((updatedDto) => {
              if (!updatedDto) return;
              // playlistService.update trả về PlaylistDto (không có tracks), nên merge để giữ tracks hiện tại
              setPlaylistInfo((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  name: updatedDto.name,
                  description: updatedDto.description,
                  isPublic: updatedDto.isPublic,
                };
              });
            })

            .catch(() => {
              // Có thể add toast thông báo ở đây nếu bạn có UI toast
            });
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemToShare={{
          type: "playlist",
          id: playlistInfo.playlistId,
          title: playlistInfo.name,
          subtitle: `Playlist - ${playlistSongs.length} bai hat`,
        }}
        onShareSuccess={(receiverName: string) => {
          onShareSuccess(
            "playlist",
            {
              id: playlistInfo.playlistId,
              title: playlistInfo.name,
              coverUrl: "",
              description: playlistInfo.description,
            },
            receiverName,
          );
        }}
      />
    </div>
  );
};

export default PlaylistDetailPage;
