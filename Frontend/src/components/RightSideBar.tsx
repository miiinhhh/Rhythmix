import {
  MoreHorizontal,
  Music2,
  Plus,
  Share2,
  Maximize2,
} from "lucide-react";
import type { SongType } from "../utils/mediaMapping";

interface RightSideBarProps {
  currentTrack: SongType | null;
  onOpenVideo?: () => void;
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

const RightSideBar = ({ currentTrack, onOpenVideo }: RightSideBarProps) => {
  const coverUrl = currentTrack?.posterUrl || FALLBACK_COVER;

  const isVideoTrack =
    currentTrack?.mediaType?.toLowerCase() === "video" ||
    Boolean(currentTrack?.videoUrl);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = FALLBACK_COVER;
  };

  return (
    <aside className="hidden h-full w-[360px] shrink-0 overflow-y-auto rounded-lg bg-zinc-900 text-white xl:block">
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

              <button
                type="button"
                className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                aria-label="More options"
              >
                <MoreHorizontal className="size-5" />
              </button>
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
                    className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    aria-label="Share"
                  >
                    <Share2 className="size-5" />
                  </button>

                  <button
                    type="button"
                    className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    aria-label="Add"
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
            <section className="overflow-hidden rounded-2xl bg-zinc-800/80">
              <div className="relative h-44">
                <img
                  src={coverUrl}
                  alt={currentTrack.artist}
                  onError={handleImageError}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <h3 className="absolute left-4 top-4 text-base font-bold text-white">
                  About the artist
                </h3>

                <p className="absolute bottom-4 left-4 text-xl font-bold text-white">
                  {currentTrack.artist}
                </p>
              </div>

              <div className="space-y-3 p-4">
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
                  className="rounded-full border border-zinc-500 px-4 py-1.5 text-sm font-bold text-white transition hover:scale-105 hover:border-white"
                >
                  Follow
                </button>
              </div>
            </section>

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
    </aside>
  );
};

export default RightSideBar;