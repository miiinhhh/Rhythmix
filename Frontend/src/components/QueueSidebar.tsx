import { X } from "lucide-react";
import type { SongType } from "../utils/mediaMapping";

interface QueueSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: SongType | null;
  queue: SongType[]; // Danh sách các bài nhạc còn lại trong playlist
}

const QueueSidebar = ({
  isOpen,
  onClose,
  currentTrack,
  queue,
}: QueueSidebarProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-screen w-80 border-l border-zinc-800 bg-zinc-900 p-6 text-white shadow-xl z-50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Current Queue</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Now Playing Section */}
        <div className="mb-8">
          <h3 className="text-sm text-zinc-400 mb-3 uppercase">Now Playing</h3>
          {currentTrack ? (
            <div className="bg-zinc-800 p-3 rounded-md">
              <p className="font-medium">{currentTrack.title}</p>
              <p className="text-xs text-zinc-400">{currentTrack.artist}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No song playing</p>
          )}
        </div>

        {/* Next Up Section */}
        <div className="flex flex-col flex-1 min-h-0">
          <h3 className="text-sm text-zinc-400 mb-3 uppercase">Next Up</h3>
          <div className="flex-1 overflow-y-auto pr-2">
            {queue.length > 0 ? (
              queue.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded cursor-pointer"
                >
                  <div className="text-zinc-400 text-sm">🎵</div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{song.title}</p>
                    <p className="text-xs text-zinc-500 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Queue is empty</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QueueSidebar;
