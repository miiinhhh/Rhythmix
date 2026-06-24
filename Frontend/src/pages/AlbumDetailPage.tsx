import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Disc,
  Pause,
  Play,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { albumService } from "../api/albumService";
import { type AlbumDetailDto, type MediaItemDto } from "../types/api";
import { mapMediaToSong, type SongType } from "../utils/mediaMapping";
import { resolveAssetUrl } from "../config/apiConfig";
import AddSongAlbumModal from "../components/AddSongAlbumModal";
import UpdateAlbumModal from "../components/UpdateAlbumModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

interface OutletContextType {
  currentSongId: string | null;
  setCurrentSongId: (id: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
  onSetPlaylistQueue?: (id: string, tracks: SongType[]) => void;
}

const mapAlbumTrackToSong = (
  track: MediaItemDto,
  albumTitle?: string,
): SongType => {
  const song = mapMediaToSong(track, albumTitle || "Album");
  return song;
};

const AlbumDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    currentSongId,
    setCurrentSongId,
    isPlaying,
    setIsPlaying,
    setSongs,
    onSetPlaylistQueue,
  } = useOutletContext<OutletContextType>();

  const [albumInfo, setAlbumInfo] = useState<AlbumDetailDto | null>(null);
  const [albumSongs, setAlbumSongs] = useState<SongType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const loadAlbum = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const album = await albumService.getById(id);
      const mappedTracks = album.tracks.map((track) =>
        mapAlbumTrackToSong(track, album.title),
      );
      setAlbumInfo(album);
      setAlbumSongs(mappedTracks);
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
    loadAlbum().catch(() => {
      setAlbumInfo(null);
      setAlbumSongs([]);
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

  const handleToggleAlbum = () => {
    const isAlbumSongPlaying = albumSongs.some(
      (song) => song.id === currentSongId,
    );

    if (!isAlbumSongPlaying && albumSongs.length > 0) {
      setCurrentSongId(albumSongs[0].id);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleDeleteAlbum = async () => {
    if (!id) return;
    try {
      await albumService.delete(id);
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete album:", error);
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  if (isLoading) return <div className="p-6 text-zinc-400">Loading...</div>;

  return (
    <div className="min-h-screen grow bg-zinc-900 p-6 text-white">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center rounded-full bg-zinc-800 px-4 py-2 text-sm font-bold hover:bg-zinc-700 transition-all active:scale-95"
      >
        <ArrowLeft className="mr-1.5 size-4" /> Back
      </button>

      {/* Header */}
      <div className="mb-8 flex items-end gap-6">
            <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-lg bg-zinc-800 shadow-2xl overflow-hidden">
              {albumInfo?.coverImageUrl ? (
                <img
                  src={resolveAssetUrl(albumInfo.coverImageUrl)}
                  alt={albumInfo.title}
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <Disc className="size-16 text-zinc-400" />
              )}
            </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Album
          </span>
          <h1 className="text-5xl font-black tracking-tight">
            {albumInfo?.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400 font-medium">
            {albumSongs[0]?.artist} - {albumInfo?.description}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={handleToggleAlbum}
          className="rounded-full bg-green-500 p-4 text-black shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause fill="black" size={24} />
          ) : (
            <Play fill="black" size={24} />
          )}
        </button>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">
            <Plus size={16} /> Add Song
          </button>
          <button onClick={() => setIsUpdateOpen(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">
            <Pencil size={16} /> Update Album
          </button>
          <button onClick={() => setIsDeleteConfirmOpen(true)}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-semibold hover:bg-zinc-700 hover:text-red-500">
            <Trash2 size={16} /> Delete Album
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="space-y-1">
        {albumSongs.map((song) => {
          const isCurrent = song.id === currentSongId;
          return (
            <div
              key={song.id}
              onDoubleClick={() => handlePlaySong(song.id)}
              className="grid grid-cols-[40px_1fr_120px] items-center gap-4 rounded-md px-4 py-3 hover:bg-zinc-800/60 transition-colors"
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
            </div>
          );
        })}
      </div>
      <AddSongAlbumModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onUploaded={loadAlbum}
        albumId={id}
        artistName={albumInfo?.tracks[0]?.artistName}
      />
      {albumInfo && (
        <UpdateAlbumModal 
          isOpen={isUpdateOpen} 
          onClose={() => setIsUpdateOpen(false)} 
          AlbumData={albumInfo}
          onUpdateSuccess={loadAlbum}
        />
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAlbum}
        itemTitle={albumInfo?.title || ""}
        type="album"
      />
    </div>
  );
};

export default AlbumDetailPage;
