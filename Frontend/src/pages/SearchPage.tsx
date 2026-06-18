import { useEffect, useMemo, useState } from "react";
import { ListMusic, Play, Search } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { searchService } from "../api/searchService";
import { userService } from "../api/userService";
import type { SearchGenrePlaylistDto, SearchMediaDto, SearchPlaylistDto, UserProfileDto } from "../types/api";
import type { SongType } from "../utils/mediaMapping";

interface OutletContextType {
  setCurrentSongId: (id: string | null) => void;
  setIsPlaying: (v: boolean) => void;
  songs: SongType[];
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
}

const browseCategories = [
  { label: "Pop", color: "oklch(0.62 0.17 145)" },
  { label: "Rock", color: "oklch(0.6 0.18 25)" },
  { label: "Indie", color: "oklch(0.55 0.16 280)" },
  { label: "Alternative", color: "oklch(0.6 0.15 200)" },
  { label: "Electronic", color: "oklch(0.58 0.18 60)" },
];

const API_ORIGIN = "http://localhost:5269";

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const resolveAssetUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  return `${API_ORIGIN}${url}`;
};

const mapSearchMediaToSong = (media: SearchMediaDto): SongType => {
  const mediaType = media.mediaType?.toLowerCase() || "audio";
  const streamUrl = `${API_ORIGIN}/api/media/${media.mediaId}/stream`;

  return {
    id: media.mediaId,
    title: media.title,
    artist: "Rhythmix artist",
    album: "Search result",
    duration: formatDuration(media.duration),
    isLiked: false,
    url: streamUrl,
    videoUrl: mediaType === "video" ? streamUrl : undefined,
    posterUrl: resolveAssetUrl(media.thumbnailUrl),
    mediaType,
  };
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserProfileDto[]>([]);
  const [mediaResults, setMediaResults] = useState<SearchMediaDto[]>([]);
  const [playlistResults, setPlaylistResults] = useState<SearchPlaylistDto[]>([]);
  const [genrePlaylists, setGenrePlaylists] = useState<SearchGenrePlaylistDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { setCurrentSongId, setIsPlaying, songs, setSongs } = useOutletContext<OutletContextType>();

  useEffect(() => {
    userService.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const hasQuery = normalizedQuery.length > 0;

  useEffect(() => {
    if (!hasQuery) {
      setMediaResults([]);
      setPlaylistResults([]);
      setGenrePlaylists([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await searchService.search(query.trim());
        setMediaResults(result.media || []);
        setPlaylistResults(result.playlists || []);
        setGenrePlaylists(result.genrePlaylists || []);
      } catch {
        setMediaResults([]);
        setPlaylistResults([]);
        setGenrePlaylists([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [hasQuery, query]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        (user.displayName || user.userName || user.email).toLowerCase().includes(normalizedQuery)
      ),
    [normalizedQuery, users]
  );

  const playSong = (media: SearchMediaDto) => {
    const song = mapSearchMediaToSong(media);
    setSongs((current) => (current.some((item) => item.id === song.id) ? current : [song, ...current]));
    setCurrentSongId(song.id);
    setIsPlaying(true);
  };

  const playGenrePlaylist = (playlist: SearchGenrePlaylistDto) => {
    const playlistSongs = playlist.tracks
      .filter((track) => track.genreId === playlist.genreId)
      .map((track) => ({
        ...mapSearchMediaToSong(track),
        album: playlist.name,
      }));

    if (playlistSongs.length === 0) return;

    const playlistSongIds = new Set(playlistSongs.map((song) => song.id));
    setSongs((current) => [...playlistSongs, ...current.filter((song) => !playlistSongIds.has(song.id))]);
    setCurrentSongId(playlistSongs[0].id);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Search</h1>
        <p className="mt-1 text-pretty text-sm text-zinc-400">Find songs and genre mixes uploaded to Rhythmix.</p>
      </div>

      <section>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song, artist, or genre"
            className="w-full rounded-full border border-zinc-800 bg-zinc-800/50 py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {hasQuery ? (
          <div className="mt-4 space-y-6">
            {isSearching && <p className="text-sm text-zinc-400">Searching...</p>}

            {genrePlaylists.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Genre playlists</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {genrePlaylists.map((playlist) => (
                    <button
                      key={playlist.genreId}
                      type="button"
                      onClick={() => playGenrePlaylist(playlist)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-left hover:bg-zinc-800"
                    >
                      <div className="flex size-12 items-center justify-center rounded-md bg-green-500/15 text-green-400">
                        <ListMusic className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{playlist.name}</div>
                        <div className="truncate text-xs text-zinc-400">{playlist.trackCount} songs</div>
                      </div>
                      <Play className="size-4 text-zinc-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {playlistResults.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Playlists</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {playlistResults.map((playlist) => (
                    <button
                      key={playlist.playlistId}
                      type="button"
                      onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-left hover:bg-zinc-800"
                    >
                      <div className="flex size-12 items-center justify-center rounded-md bg-zinc-800 text-zinc-400">
                        <ListMusic className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{playlist.name}</div>
                        <div className="truncate text-xs text-zinc-400">
                          {playlist.trackCount} songs - {playlist.isPublic ? "Public" : "Private"}
                        </div>
                      </div>
                      <Play className="size-4 text-zinc-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredUsers.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Users</h2>
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 hover:bg-zinc-800"
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} className="size-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-white">
                          {(user.displayName || user.userName || user.email).slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-white">{user.displayName || user.userName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mediaResults.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Songs</h2>
                <div className="space-y-2">
                  {mediaResults.map((media) => {
                    const song = songs.find((item) => item.id === media.mediaId) || mapSearchMediaToSong(media);
                    return (
                      <div
                        key={media.mediaId}
                        onClick={() => playSong(media)}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 hover:bg-zinc-800"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">{song.title}</div>
                          <div className="truncate text-xs text-zinc-400">{song.artist} - {song.album}</div>
                        </div>
                        <span className="text-xs text-zinc-500">{song.duration}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isSearching && mediaResults.length === 0 && playlistResults.length === 0 && genrePlaylists.length === 0 && filteredUsers.length === 0 && (
              <p className="text-sm text-zinc-400">No results found.</p>
            )}
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-white">Browse genres</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {browseCategories.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setQuery(cat.label)}
                  className="relative flex aspect-[1.6/1] cursor-pointer items-end overflow-hidden rounded-lg p-4 text-left transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: cat.color }}
                >
                  <span className="text-base font-bold text-black">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
