import { Play, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, Music2 } from "lucide-react";

const PlayerBar = () => {
  return (
    <footer className="flex h-20 shrink-0 items-center justify-between gap-4 border-t border-zinc-800 bg-zinc-900 px-4 text-white">
      {/* Now playing */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-zinc-800">
          <Music2 className="size-6 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">Midnight City</p>
          <p className="truncate text-xs text-zinc-400">M83</p>
        </div>
        <button type="button" className="ml-2 hidden text-zinc-400 transition-colors hover:text-white sm:block">
          <Heart className="size-4" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex max-w-md flex-1 flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <button type="button" className="text-zinc-400 hover:text-white"><Shuffle className="size-4" /></button>
          <button type="button" className="text-zinc-400 hover:text-white"><SkipBack className="size-5 fill-current" /></button>
          <button type="button" className="flex size-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105">
            <Play className="size-4 fill-black text-black ml-0.5" />
          </button>
          <button type="button" className="text-zinc-400 hover:text-white"><SkipForward className="size-5 fill-current" /></button>
          <button type="button" className="text-zinc-400 hover:text-white"><Repeat className="size-4" /></button>
        </div>
        
        {/* Progress Timeline Slider UI */}
        <div className="flex w-full items-center gap-2">
          <span className="text-xs text-zinc-400 tabular-nums">1:24</span>
          <div className="group relative h-1 flex-1 rounded-full bg-zinc-700 cursor-pointer">
            <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-zinc-200 group-hover:bg-green-500" />
          </div>
          <span className="text-xs text-zinc-400 tabular-nums">4:03</span>
        </div>
      </div>

      {/* Volume UI */}
      <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
        <Volume2 className="size-4 text-zinc-400" />
        <div className="group relative h-1 w-24 rounded-full bg-zinc-700 cursor-pointer">
          <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-zinc-200 group-hover:bg-green-500" />
        </div>
      </div>
    </footer>
  );
}

export default PlayerBar;