import { Music2, Play } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { SongType } from "../utils/mediaMapping";

interface OutletContextType {
  currentSongId: string | null;
  setCurrentSongId: (id: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  songs: SongType[];
}

const HomePage = () => {
  const { currentSongId, setCurrentSongId, isPlaying, setIsPlaying, songs } =
    useOutletContext<OutletContextType>();

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
          Songs loaded from your Rhythmix database.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">All Songs</h2>

        {songs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-400">
            No songs found from API. Check <code>/api/Media/discovery</code>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      <img src={song.posterUrl} alt={song.title} className="size-full object-cover" />
                    ) : (
                      <Music2 className="size-8" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-2">
                    <h3 className={`truncate text-sm font-semibold ${isCurrent ? "text-green-500" : "text-white"}`}>
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
