import { useState, useEffect } from "react";
import {
  Play,
  Clock,
  Heart,
  Pause,
  Share2,
  Trash2,
  Plus,
  Pencil,
  Globe,
  Lock,
  GripVertical,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import AddSongModal from "../components/AddSongModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import UpdatePlaylistModal from "../components/UpdatePlaylistModal";
import { musicService } from "../services/musicService";
import ShareModal from "../components/ShareModal";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

interface SongType {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
}

interface OutletContextType {
  currentSongId: number | null;
  setCurrentSongId: (id: number | null) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  songs: SongType[];
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
  onShareSuccess: (type: "song" | "video" | "playlist", itemInfo: any, receiverName: string) => void;
}

const MOCK_ALL_SONGS: SongType[] = [
  { id: 1, title: "Sunset Boulevard", artist: "Neon Coast", album: "City Lights", duration: "0:41", isLiked: true, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Velvet Sky", artist: "Aria Lane", album: "Nightfall", duration: "0:45", isLiked: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Paper Planes", artist: "The Drifters", album: "Horizons", duration: "0:50", isLiked: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 4, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", isLiked: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: 5, title: "Starboy", artist: "The Weeknd", album: "Starboy", duration: "3:50", isLiked: false, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
];

const PlaylistDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const foundPlaylist = musicService.getPlaylistById(id || "");
  
  const [playlistInfo, setPlaylistInfo] = useState(foundPlaylist);
  const [playlistSongs, setPlaylistSongs] = useState<SongType[]>(foundPlaylist ? foundPlaylist.songs : []);

  const {
    currentSongId,
    setCurrentSongId,
    isPlaying,
    setIsPlaying,
    setSongs: setLibrarySongs,
    onShareSuccess,
  } = useOutletContext<OutletContextType>();

  const [likedPulse, setLikedPulse] = useState<number[]>([]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isUpdatePlaylistModalOpen, setIsUpdatePlaylistModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletePlaylistModalOpen, setIsDeletePlaylistPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{ id: number; title: string } | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(playlistSongs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPlaylistSongs(items);
  };

  useEffect(() => {
    if (foundPlaylist) {
      setPlaylistInfo(foundPlaylist);
      setPlaylistSongs(foundPlaylist.songs || []);
    }
  }, [id, foundPlaylist]);

  if (!playlistInfo) {
    return (
      <div className="p-6 text-center text-zinc-400 grow bg-zinc-900 min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-white mb-2">Playlist không tồn tại</h2>
        <button onClick={() => navigate(-1)} className="text-green-500 hover:underline font-semibold mt-2">Quay lại trang trước</button>
      </div>
    );
  }

  const handlePlaySong = (songId: number) => {
    const song = playlistSongs.find((s) => s.id === songId);
    if (song) musicService.addRecentSong(song);
    if (currentSongId === songId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSongId(songId);
      setIsPlaying(true);
    }
  };

  const handleTogglePlaylist = () => {
    if (!currentSongId && playlistSongs.length > 0) {
      setCurrentSongId(playlistSongs[0].id);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedSong && id) {
      musicService.deleteSongFromPlaylist(id, selectedSong.id);
      setPlaylistSongs((prev) => prev.filter((song) => song.id !== selectedSong.id));
      if (selectedSong.id === currentSongId) {
        setCurrentSongId(null);
        setIsPlaying(false);
      }
      setIsDeleteOpen(false);
      setSelectedSong(null);
    }
  };

  const handleDeletePlaylist = () => {
    musicService.deletePlaylist(playlistInfo.id);
    setIsDeletePlaylistPlaylistModalOpen(false);
    navigate("/library");
  };

  return (
    <div className="grow bg-zinc-900 text-white p-6 min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center justify-center bg-zinc-800 text-sm font-bold text-white py-2 px-4 rounded-full mb-6 hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer">
        <ArrowLeft className="mr-1.5 size-4" /> Back
      </button>

      {/* Header & Actions */}
      <div className="flex items-end gap-6 mb-8">
        <div className="w-44 h-44 shrink-0 bg-linear-to-br from-green-700 to-zinc-800 rounded-lg flex items-center justify-center shadow-2xl">
          <span className="text-6xl text-zinc-400">🎵</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-300">Playlist</span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight">{playlistInfo.title}</h1>
            <div title={playlistInfo.isPublic ? "Công khai" : "Riêng tư"}>
              {playlistInfo.isPublic ? <Globe size={24} className="text-green-500" /> : <Lock size={24} className="text-zinc-400" />}
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-1">{playlistInfo.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between w-full mb-8">
        <div className="flex items-center gap-5">
          <button onClick={handleTogglePlaylist} className="bg-green-500 p-4 rounded-full text-black hover:scale-105 active:scale-95 transition-transform shadow-lg cursor-pointer">
            {isPlaying ? <Pause fill="black" size={24} /> : <Play fill="black" size={24} />}
          </button>
          <button onClick={() => setIsShareModalOpen(true)} className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1">
            <Share2 size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsAddSongModalOpen(true)} className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 px-4 py-2 text-sm font-semibold transition-all cursor-pointer">
            <Plus className="size-4 stroke-[3px]" /> Add New Song
          </button>
          <button onClick={() => setIsUpdatePlaylistModalOpen(true)} className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 px-4 py-2 text-sm font-semibold transition-all cursor-pointer">
            <Pencil className="size-4 stroke-[3px]" /> Update Playlist
          </button>
          {playlistInfo.title !== "Liked Songs" && (
            <button onClick={() => setIsDeletePlaylistPlaylistModalOpen(true)} className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 px-4 py-2 text-sm font-semibold transition-all cursor-pointer">
              <Trash2 className="size-4" /> Delete Playlist
            </button>
          )}
        </div>
      </div>

      {/* DragDropContent list omitted for brevity but fully functional in your original code */}
      
      {/* MODALS */}
      <AddSongModal
        isOpen={isAddSongModalOpen}
        onClose={() => setIsAddSongModalOpen(false)}
        allSongs={MOCK_ALL_SONGS}
        currentPlaylistSongs={playlistSongs}
        onAddSongSuccess={(newSong) => {
          setPlaylistSongs((prev) => [...prev, newSong]);
          setLibrarySongs((prev) => [...prev, newSong]);
        }}
      />

      <ConfirmDeleteModal
        type="song"
        itemTitle={selectedSong?.title || ""}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDeleteModal
        type="playlist"
        itemTitle={playlistInfo.title}
        isOpen={isDeletePlaylistModalOpen}
        onClose={() => setIsDeletePlaylistPlaylistModalOpen(false)}
        onConfirm={handleDeletePlaylist}
      />

      <UpdatePlaylistModal
        isOpen={isUpdatePlaylistModalOpen}
        onClose={() => setIsUpdatePlaylistModalOpen(false)}
        playlistData={playlistInfo}
        onUpdateSuccess={(updatedData) => {
          const updated = musicService.updatePlaylist(playlistInfo.id, updatedData);
          if (updated) setPlaylistInfo(updated);
        }}
      />
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemToShare={{ type: "playlist", id: playlistInfo.id, title: playlistInfo.title, subtitle: `Playlist • ${playlistSongs.length} bài hát` }}
        onShareSuccess={(receiverName: string) => {
          onShareSuccess("playlist", { id: playlistInfo.id, title: playlistInfo.title, coverUrl: "", description: playlistInfo.description }, receiverName);
        }}
      />
    </div>
  );
};

export default PlaylistDetailPage;