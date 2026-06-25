import { useEffect, useState } from "react";
import { Disc3, ListMusic, Music2, Play } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { albumService } from "../api/albumService";
import { aiService } from "../api/aiService";
import { playlistService } from "../api/playlistService";
import type { AlbumDto, PlaylistDto } from "../types/api";
import { mapMediaToSong, type SongType } from "../utils/mediaMapping";
import { API_BASE_URL } from "../config/apiConfig";

interface OutletContextType {
  currentSongId: string | null;
  setCurrentSongId: (id: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  songs: SongType[];
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
}

const resolveAssetUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  return `${API_BASE_URL}${url}`;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { currentSongId, setCurrentSongId, isPlaying, setIsPlaying, songs } =
    useOutletContext<OutletContextType>();

  const [myPlaylists, setMyPlaylists] = useState<PlaylistDto[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<PlaylistDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [recommendations, setRecommendations] = useState<SongType[]>([]);
  const [recommendationSource, setRecommendationSource] = useState<"openrouter" | "database" | "">("");

  useEffect(() => {
    playlistService.getAll().then(setMyPlaylists).catch(() => setMyPlaylists([]));
    playlistService.getPublic().then(setPublicPlaylists).catch(() => setPublicPlaylists([]));
    albumService.getMyAlbums().then(setAlbums).catch(() => setAlbums([]));
    aiService
      .getRecommendations(8)
      .then(({ items, source }) => {
        setRecommendations(items.map((item) => mapMediaToSong(item)));
        setRecommendationSource(source);
      })
      .catch(() => {
        setRecommendations([]);
        setRecommendationSource("");
      });
  }, []);

  const handlePlay = (song: SongType) => {
    if (currentSongId === song.id) {
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentSongId(song.id);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Home</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Songs, playlists, and albums loaded from your Rhythmix database.
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">For you</h2>
          {recommendationSource && (
            <span className="text-xs font-medium text-zinc-400">
              {recommendationSource === "openrouter" ? "Recommended by OpenRouter" : "Recommended from library"}
            </span>
          )}
        </div>
        {recommendations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 py-10 text-center text-sm text-zinc-400">
            No songs to recommend.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((song) => (
              <article
                key={song.id}
                onClick={() => handlePlay(song)}
                className="group flex cursor-pointer items-center gap-3 rounded-md bg-zinc-900 p-3 transition-colors hover:bg-zinc-800"
              >
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-800">
                  {song.posterUrl ? (
                    <img src={song.posterUrl} alt={song.title} className="size-full object-cover" />
                  ) : (
                    <Music2 className="size-5 text-zinc-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">{song.title}</h3>
                  <p className="truncate text-xs text-zinc-400">{song.artist}</p>
                </div>
                <Play className="size-4 shrink-0 text-green-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Your Playlists
        </h2>
        {myPlaylists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 py-10 text-center text-sm text-zinc-400">
            No playlists yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {myPlaylists.map((playlist) => {
              const thumbnailUrl = resolveAssetUrl(playlist.thumbnailUrl);
              return (
                <article
                  key={playlist.playlistId}
                  onClick={() =>
                    navigate(`/playlist/${playlist.playlistId}`, {
                      state: { thumbnail: playlist.thumbnailUrl },
                    })
                  }
                  className="group cursor-pointer rounded-md bg-zinc-900/70 p-4 transition-colors hover:bg-zinc-800"
                >
                  <div className="relative mb-3">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={playlist.name}
                        className="aspect-square w-full rounded-md object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                        <ListMusic className="size-10 text-zinc-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 flex size-11 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <Play className="size-5 fill-black text-black" />
                    </button>
                  </div>
                  <h3 className="truncate text-sm font-semibold text-white">
                    {playlist.name}
                  </h3>
                  <p className="mt-1 truncate text-xs text-zinc-400">
                    Playlist - {playlist.trackCount ?? 0} songs - {" "}
                    {playlist.isPublic ? "Public" : "Private"}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Public Playlists
        </h2>
        {publicPlaylists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 py-10 text-center text-sm text-zinc-400">
            No public playlists yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {publicPlaylists.map((playlist) => {
              const thumbnailUrl = resolveAssetUrl(playlist.thumbnailUrl);
              return (
                <article
                  key={playlist.playlistId}
                  onClick={() =>
                    navigate(`/playlist/${playlist.playlistId}`, {
                      state: { thumbnail: playlist.thumbnailUrl },
                    })
                  }
                  className="group cursor-pointer rounded-md bg-zinc-900/70 p-4 transition-colors hover:bg-zinc-800"
                >
                  <div className="relative mb-3">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={playlist.name}
                        className="aspect-square w-full rounded-md object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                        <ListMusic className="size-10 text-zinc-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 flex size-11 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <Play className="size-5 fill-black text-black" />
                    </button>
                  </div>
                  <h3 className="truncate text-sm font-semibold text-white">
                    {playlist.name}
                  </h3>
                  <p className="mt-1 truncate text-xs text-zinc-400">
                    Playlist - {playlist.trackCount ?? 0} songs
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">Your Albums</h2>
        {albums.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 py-10 text-center text-sm text-zinc-400">
            No albums yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {albums.map((album) => {
              const coverUrl = resolveAssetUrl(album.coverImageUrl);
              return (
                <article
                  key={album.albumId}
                  onClick={() => navigate(`/album/${album.albumId}`)}
                  className="group cursor-pointer rounded-md bg-zinc-900/70 p-4 transition-colors hover:bg-zinc-800"
                >
                  <div className="relative mb-3">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={album.title}
                        className="aspect-square w-full rounded-md object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                        <Disc3 className="size-10 text-zinc-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 flex size-11 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <Play className="size-5 fill-black text-black" />
                    </button>
                  </div>
                  <h3 className="truncate text-sm font-semibold text-white">
                    {album.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-zinc-400">
                    Album - {album.trackCount} songs
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">All Songs</h2>

        {songs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-400">
            No songs found from API. Check <code>/api/Media/discovery</code>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => {
              const isCurrent = currentSongId === song.id;

              return (
                <article
                  key={song.id}
                  onClick={() => handlePlay(song)}
                  className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-md bg-zinc-900 pr-4 transition-colors hover:bg-zinc-800"
                >
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden bg-zinc-800 text-zinc-500">
                    {song.posterUrl ? (
                      <img
                        src={song.posterUrl}
                        alt={song.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Music2 className="size-8" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-2">
                    <h3
                      className={`truncate text-sm font-semibold ${isCurrent ? "text-green-500" : "text-white"}`}
                    >
                      {song.title}
                    </h3>
                    <p className="truncate text-xs text-zinc-400">
                      {song.artist} - {song.duration}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 flex size-10 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105"
                  >
                    <Play className="ml-0.5 size-5 fill-black text-black" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
