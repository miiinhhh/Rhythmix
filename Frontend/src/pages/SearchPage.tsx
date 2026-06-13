import { useMemo, useState } from "react";
import { Music2, Play, Search } from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { MOCK_USERS } from "../data/mockData";

interface OutletContextType {
  currentSongId: number | null;
  setCurrentSongId: (id: number | null) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
}
export interface SongType {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
}

export interface PlaylistType {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  isPublic: boolean;
  type: "playlists" | "albums";
  songs: SongType[];
}

const browseCategories = [
  { label: "Podcasts", color: "oklch(0.6 0.18 25)" },
  { label: "Charts", color: "oklch(0.55 0.16 280)" },
  { label: "New Releases", color: "oklch(0.6 0.15 200)" },
  { label: "Discover", color: "oklch(0.62 0.17 145)" },
  { label: "Live Events", color: "oklch(0.58 0.18 60)" },
  { label: "Workout", color: "oklch(0.55 0.2 15)" },
];

const MOCK_SONGS: SongType[] = [
  { id: 1, title: "Sunset Boulevard", artist: "Neon Coast", album: "City Lights", duration: "0:41", isLiked: true, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Velvet Sky", artist: "Aria Lane", album: "Nightfall", duration: "0:45", isLiked: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Paper Planes", artist: "The Drifters", album: "Horizons", duration: "0:50", isLiked: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 4, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", isLiked: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: 5, title: "Starboy", artist: "The Weeknd", album: "Starboy", duration: "3:50", isLiked: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
];

const MOCK_ARTISTS = [
  { id: "the-weeknd", name: "The Weeknd" },
  { id: "neon-coast", name: "Neon Coast" },
  { id: "aria-lane", name: "Aria Lane" },
  { id: "the-drifters", name: "The Drifters" },
];

const MOCK_PLAYLISTS: PlaylistType[] = [
  {
    id: "daily-mix-1",
    title: "Daily Mix 1",
    subtitle: "Playlist · 3 songs",
    description: "The Weeknd, Dua Lipa and more",
    isPublic: true,
    type: "playlists",
    songs: MOCK_SONGS.slice(0, 3),
  },
  {
    id: "summer-2026",
    title: "Summer 2026",
    subtitle: "Playlist · 2 songs",
    description: "Chill summer vibes",
    isPublic: false,
    type: "playlists",
    songs: MOCK_SONGS.slice(3, 5),
  },
  {
    id: "deep-focus",
    title: "Deep Focus",
    subtitle: "Playlist · 120 songs",
    description: "Concentrate with these ambient tracks",
    isPublic: true,
    type: "playlists",
    songs: [],
  },
];

const trending = MOCK_PLAYLISTS.filter((p) => p.isPublic).slice(0, 3);

const SearchPage = () => {

  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const songResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return MOCK_SONGS.filter(
      (song) =>
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artist.toLowerCase().includes(normalizedQuery) ||
        song.album.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const playlistResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return MOCK_PLAYLISTS.filter(
      (playlist) =>
        playlist.isPublic &&
        (
          playlist.title.toLowerCase().includes(normalizedQuery) ||
          playlist.description.toLowerCase().includes(normalizedQuery) ||
          playlist.subtitle.toLowerCase().includes(normalizedQuery)
        )
    );
  }, [normalizedQuery]);

  const artistResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return MOCK_ARTISTS.filter((artist) => artist.name.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery]);

  const hasQuery = normalizedQuery.length > 0;

  const { setCurrentSongId, setIsPlaying } =
  useOutletContext<OutletContextType>();

  // Lọc người dùng theo tên
  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  
  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Search</h1>
        <p className="mt-1 text-pretty text-sm text-zinc-400">Find your favorite songs, artists, and playlists.</p>
      </div>

      <section>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full rounded-full border border-zinc-800 bg-zinc-800/50 py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {hasQuery ? (
          <div className="mt-4 space-y-6">
            {filteredUsers.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Users</h2>
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/60"
                    >
                      <img src={user.avatarUrl} className="size-10 rounded-full object-cover" />
                      <span className="text-white font-semibold">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {artistResults.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Artists</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {artistResults.map((artist) => (
                    <button
                      key={artist.id}
                      type="button"
                      className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-5 text-left transition-colors hover:bg-zinc-800"
                    >
                      <div className="flex size-14 items-center justify-center rounded-full bg-zinc-800 text-white">
                        {artist.name.slice(0, 1)}
                      </div>
                      <div className="mt-3 text-sm font-semibold text-white">{artist.name}</div>
                      <div className="text-xs text-zinc-400">Artist</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {songResults.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Songs</h2>
                <div className="space-y-2">
                  {songResults.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => {
                        setCurrentSongId(song.id);
                        setIsPlaying(true);
                      }}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{song.title}</div>
                        <div className="text-xs text-zinc-400">
                          {song.artist} • {song.album}
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500">{song.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {playlistResults.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Playlists</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {playlistResults.map((playlist) => (
                    <article key={playlist.id}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800">
                      <div className="relative mb-3">
                        <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                          <Music2 className="size-10 text-zinc-400" />
                        </div>
                        <button
                          type="button"
                          className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
                        >
                          <Play className="size-5 fill-black text-black" />
                        </button>
                      </div>
                      <h3 className="truncate text-sm font-semibold text-white">{playlist.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{playlist.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {songResults.length === 0 && playlistResults.length === 0 && artistResults.length === 0 && (
              <p className="text-sm text-zinc-400">No results found.</p>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <section>
              <h2 className="mb-4 text-xl font-bold tracking-tight text-white">Browse all</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {browseCategories.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    className="relative flex aspect-[1.6/1] items-end overflow-hidden rounded-lg p-4 text-left transition-transform hover:scale-[1.02] cursor-pointer"
                    style={{ backgroundColor: cat.color }}
                  >
                    <span className="text-base font-bold text-black">{cat.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold tracking-tight text-white">Trending now</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {trending.map((item) => (
                  <article key={item.id} className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800">
                    <div className="relative mb-3">
                      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 shadow-lg">
                        <Music2 className="size-10 text-zinc-400" />
                      </div>
                      <button
                        type="button"
                        className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        <Play className="size-5 fill-black text-black" />
                      </button>
                    </div>
                    <h3 className="truncate text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{item.subtitle}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
export default SearchPage;