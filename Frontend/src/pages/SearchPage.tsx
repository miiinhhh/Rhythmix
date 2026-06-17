import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { userService } from "../api/userService";
import type { UserProfileDto } from "../types/api";
import type { SongType } from "../utils/mediaMapping";

interface OutletContextType {
  setCurrentSongId: (id: string | null) => void;
  setIsPlaying: (v: boolean) => void;
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

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserProfileDto[]>([]);
  const { setCurrentSongId, setIsPlaying, songs } = useOutletContext<OutletContextType>();

  useEffect(() => {
    userService.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const hasQuery = normalizedQuery.length > 0;

  const songResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artist.toLowerCase().includes(normalizedQuery) ||
        song.album.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery, songs]);

  const filteredUsers = users.filter((user) =>
    (user.displayName || user.userName || user.email).toLowerCase().includes(normalizedQuery)
  );

  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Search</h1>
        <p className="mt-1 text-pretty text-sm text-zinc-400">Find songs uploaded to Rhythmix.</p>
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
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 hover:bg-zinc-800"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{song.title}</div>
                        <div className="text-xs text-zinc-400">
                          {song.artist} - {song.album}
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500">{song.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {songResults.length === 0 && filteredUsers.length === 0 && (
              <p className="text-sm text-zinc-400">No results found.</p>
            )}
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-white">Browse all</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {browseCategories.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
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
