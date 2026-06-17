import { Play, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { aiService } from "../api";

interface RecommendedSong {
  mediaId: string;
  title: string;
  description: string;
  mediaType: string;
  duration: number;
  thumbnailUrl: string;
}

const HomePage = () => {
  const [recommendations, setRecommendations] = useState<RecommendedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await aiService.getRecommendations(10);
        setRecommendations(data || []);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Unable to load recommendations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handlePlay = (song: RecommendedSong) => {
    console.log("Play song:", song.title);
    // TODO: Integrate with player
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Home</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Jump back into your favorite mixes and playlists.
        </p>
      </div>

      {/* AI Recommendations Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-5 text-yellow-400" />
          <h2 className="text-xl font-semibold text-white">Made For You</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="size-5 animate-spin" />
            <span>Loading recommendations...</span>
          </div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : recommendations.length === 0 ? (
          <div className="text-zinc-400">
            No recommendations yet. Start listening to get personalized suggestions!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((song) => (
              <article
                key={song.mediaId}
                className="group flex items-center gap-4 overflow-hidden rounded-md bg-zinc-900 pr-4 transition-colors hover:bg-zinc-800 cursor-pointer relative"
                onClick={() => handlePlay(song)}
              >
                <div className="size-20 shrink-0 bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold overflow-hidden">
                  {song.thumbnailUrl ? (
                    <img
                      src={song.thumbnailUrl}
                      alt={song.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    "Mix"
                  )}
                </div>
                <div className="min-w-0 flex-1 py-2">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {song.title}
                  </h3>
                  <p className="truncate text-xs text-zinc-400">{song.description}</p>
                </div>
                <button className="absolute right-4 flex size-10 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105">
                  <Play className="size-5 fill-black text-black ml-0.5" />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Featured Section (static for now) */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Featured Mixes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Daily Mix 1", subtitle: "Made for you" },
            { title: "Chill Vibes", subtitle: "Relax and unwind" },
            { title: "Top Hits 2026", subtitle: "The biggest tracks" },
            { title: "Focus Flow", subtitle: "Deep concentration" },
            { title: "Throwback", subtitle: "Classics from the 2000s" },
            { title: "Late Night", subtitle: "Smooth evening sounds" },
          ].map((item) => (
            <article
              key={item.title}
              className="group flex items-center gap-4 overflow-hidden rounded-md bg-zinc-900 pr-4 transition-colors hover:bg-zinc-800 cursor-pointer relative"
            >
              <div className="size-20 shrink-0 bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                Mix
              </div>
              <div className="min-w-0 flex-1 py-2">
                <h3 className="truncate text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="truncate text-xs text-zinc-400">{item.subtitle}</p>
              </div>
              <button className="absolute right-4 flex size-10 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105">
                <Play className="size-5 fill-black text-black ml-0.5" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;