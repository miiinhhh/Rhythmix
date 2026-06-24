import React, { useState, useEffect } from "react";
import { PlusCircle, Plus, Check } from "lucide-react";
import { mediaService } from "../api";
import { mapMediaToSong } from "../utils/mediaMapping";
import type { SongType } from "../utils/mediaMapping";

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlaylistSongs: SongType[];
  onAddSongSuccess: (song: SongType) => void;
}

const AddSongModal: React.FC<AddSongModalProps> = ({ 
  isOpen, 
  onClose, 
  currentPlaylistSongs,
  onAddSongSuccess,
}) => {
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [allSongs, setAllSongs] = useState<SongType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllSongs();
    }
  }, [isOpen]);

  const loadAllSongs = async () => {
        setIsLoading(true);
        try {
            const mediaItems = await mediaService.getDiscovery();
            setAllSongs(mediaItems.map(item => mapMediaToSong(item)));
        } catch (error) {
            console.error("Failed to load songs:", error);
        } finally {
            setIsLoading(false);
        }
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-xl h-[80vh] flex flex-col shadow-2xl relative">
        
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Plus size={20} className="mr-2 text-zinc-400" />
            Thêm vào danh sách phát này
          </h2>
          <button 
            type="button"
            onClick={() => {
              onClose();
              setSongSearchQuery("");
            }}
            className="text-zinc-400 hover:text-white text-sm font-semibold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>

        <div className="p-4 bg-zinc-900/50">
          <input
            type="text"
            placeholder="Tìm kiếm bài hát để thêm..."
            value={songSearchQuery}
            onChange={(e) => setSongSearchQuery(e.target.value)}
            className="w-full bg-zinc-800 text-white placeholder-zinc-400 text-sm pl-4 pr-4 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 border border-transparent"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 select-none custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            allSongs
              .filter((song) => {
                return (
                  song.title.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
                  song.artist.toLowerCase().includes(songSearchQuery.toLowerCase())
                );
              })
              .map((song) => {
                    const isAlreadyAdded = currentPlaylistSongs.some(
                      (playlistSong) => playlistSong.id === song.id
                    );

                    return (
                      <div 
                        key={song.id}
                        className="flex items-center justify-between p-2 hover:bg-zinc-800/60 rounded-md transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center shrink-0 overflow-hidden">
                            {song.posterUrl ? (
                              <img 
                                src={song.posterUrl}
                                alt={song.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('span');
                                    fallback.textContent = '🎵';
                                    fallback.style.fontSize = '16px';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <span>🎵</span>
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-semibold text-white truncate">{song.title}</p>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
                          </div>
                        </div>

                    {isAlreadyAdded ? (
                      <div className="p-1 text-green-500" title="Đã có trong playlist">
                        <Check size={22} className="stroke-[3]" /> 
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddSongSuccess(song);
                        }}
                        className="text-zinc-400 hover:text-white transition-all cursor-pointer p-1"
                        title="Thêm vào playlist"
                      >
                        <PlusCircle size={22} className="hover:scale-110 transition-transform block" />
                      </button>
                    )}
                  </div>
                  );
              })
          )}

          {!isLoading && allSongs.filter(s => s.title.toLowerCase().includes(songSearchQuery.toLowerCase()) || s.artist.toLowerCase().includes(songSearchQuery.toLowerCase())).length === 0 && (
            <div className="text-center text-sm text-zinc-500 py-8">
              Không tìm thấy bài hát phù hợp.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddSongModal;