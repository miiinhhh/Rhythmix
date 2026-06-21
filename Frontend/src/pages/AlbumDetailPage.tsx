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
import { mediaService } from "../api/mediaService";
import { type AlbumDetailDto } from "../types/api";
import { type SongType } from "../utils/mediaMapping";

const AlbumDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentSongId, setCurrentSongId, isPlaying, setIsPlaying } =
    useOutletContext<any>();

  const [albumInfo, setAlbumInfo] = useState<AlbumDetailDto | null>(null);
  const [albumSongs, setAlbumSongs] = useState<SongType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatAlbumDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  
  const loadAlbum = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const album = await albumService.getById(id);
      const mappedTracks = album.tracks.map((track) => ({
        id: track.mediaId,
        title: track.title,
        artist: track.artistName || "Unknown Artist",
        album: album.title,
        duration: formatAlbumDuration(track.duration > 300 ? track.duration / 3 : track.duration),
        isLiked: false,
        url: mediaService.getMediaStream(track.mediaId),
        posterUrl: track.thumbnailUrl,
        mediaType: "audio",
      }));
      setAlbumInfo(album);
      setAlbumSongs(mappedTracks);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlbum();
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
    if (!currentSongId && albumSongs.length > 0) {
      setCurrentSongId(albumSongs[0].id);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
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
              src={albumInfo.coverImageUrl}
              className="h-full w-full object-cover"
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
            {albumInfo?.description}
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
          <button className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">
            <Plus size={16} /> Add Song
          </button>
          <button className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">
            <Pencil size={16} /> Update Album
          </button>
          <button className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-semibold hover:bg-zinc-700 hover:text-red-500">
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
    </div>
  );
};

export default AlbumDetailPage;
