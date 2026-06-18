import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

type FollowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  list: any[];
};

const API_ORIGIN = "http://localhost:5269";

const resolveAssetUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  return `${API_ORIGIN}${url}`;
};

const FollowModal = ({ isOpen, onClose, title, list }: FollowModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm border border-zinc-800 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-black text-white">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {list.length > 0 ? (
            list.map((u) => {
              const isArtist = u.itemType === "artist" || u.artistId || u.ArtistId;
              const id = u.id || u.Id;
              const name = u.displayName || u.DisplayName || u.userName || u.UserName || u.name || u.Name || u.email || "Unknown";
              const avatarUrl = resolveAssetUrl(u.avatarUrl || u.AvatarUrl || u.coverImageUrl || u.CoverImageUrl || "");

              return (
                <div
                  key={id || u.artistId || u.ArtistId}
                  onClick={() => {
                    if (!isArtist && id) handleUserClick(id);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isArtist ? "cursor-default" : "hover:bg-zinc-800 cursor-pointer"
                  }`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} className={`size-10 object-cover ${isArtist ? "rounded-md" : "rounded-full"}`} alt={name} />
                  ) : (
                    <div className={`flex size-10 items-center justify-center bg-zinc-800 text-sm font-bold text-white ${isArtist ? "rounded-md" : "rounded-full"}`}>
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-white font-medium">{name}</div>
                    {isArtist && <div className="text-xs text-zinc-500">Artist</div>}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-zinc-500 text-sm text-center py-4">Chua co ai o day.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
