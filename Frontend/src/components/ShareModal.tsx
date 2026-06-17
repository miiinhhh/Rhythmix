import { useEffect, useState } from "react";
import { Check, Search, Send, X } from "lucide-react";
import { shareService } from "../api/shareService";
import { MOCK_USERS, sendShareItem } from "../data/mockData";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToShare: {
    type: "song" | "playlist" | "video";
    id: string | number;
    title: string;
    subtitle: string;
  };
  onShareSuccess?: (receiverName: string) => void;
}

const isGuid = (value: string | number) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const ShareModal = ({ isOpen, onClose, itemToShare, onShareSuccess }: ShareModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentRecords, setSentRecords] = useState<string[]>([]);
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSentRecords([]);
      setSearchQuery("");
      setShareError("");
    }
  }, [itemToShare.id, itemToShare.type, isOpen]);

  if (!isOpen) return null;

  const currentUserId = localStorage.getItem("currentUserId") || "user-alex";
  const currentUserName = localStorage.getItem("currentUserName") || "Alex Mercer";

  const filteredUsers = MOCK_USERS.filter(
    (user) =>
      user.id !== currentUserId &&
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async (receiverId: string, receiverName: string) => {
    try {
      setShareError("");

      if (isGuid(receiverId) && isGuid(itemToShare.id)) {
        await shareService.create({
          receiverId,
          mediaId:
            itemToShare.type === "song" || itemToShare.type === "video"
              ? String(itemToShare.id)
              : undefined,
          playlistId: itemToShare.type === "playlist" ? String(itemToShare.id) : undefined,
          message: itemToShare.subtitle,
        });
      } else {
        sendShareItem({
          senderId: currentUserId,
          senderName: currentUserName,
          receiverId,
          type: itemToShare.type,
          itemId: itemToShare.id,
          itemTitle: itemToShare.title,
          itemSubtitle: itemToShare.subtitle,
        });
      }

      const recordKey = `${receiverId}-${itemToShare.type}`;
      setSentRecords((prev) => [...prev, recordKey]);
      onShareSuccess?.(receiverName);
    } catch (error: any) {
      setShareError(error?.response?.data?.message || error?.message || "Khong gui duoc chia se.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div>
            <h3 className="text-sm font-bold text-white">
              {itemToShare.type === "song" && "Chia se bai hat"}
              {itemToShare.type === "video" && "Chia se video"}
              {itemToShare.type === "playlist" && "Chia se playlist"}
            </h3>
            <p className="mt-0.5 max-w-[250px] truncate text-xs text-zinc-400">
              Dang chia se: {itemToShare.title}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-zinc-400 hover:text-white">
            <X className="size-4" />
          </button>
        </div>

        {shareError && (
          <div className="rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
            {shareError}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Tim ten ban be muon gui..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-md bg-zinc-800 py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div className="custom-scrollbar max-h-60 space-y-2 overflow-y-auto pr-1">
          {filteredUsers.map((user) => {
            const currentRecordKey = `${user.id}-${itemToShare.type}`;
            const hasSent = sentRecords.includes(currentRecordKey);

            return (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg bg-zinc-800/40 p-2 transition-colors hover:bg-zinc-800/80"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <img src={user.avatarUrl} alt={user.name} className="size-8 rounded-full object-cover" />
                  <span className="truncate text-xs font-semibold text-white">{user.name}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSend(user.id, user.name)}
                  disabled={hasSent}
                  className={`flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-all active:scale-95 ${
                    hasSent
                      ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
                      : "bg-green-500 text-black hover:bg-green-400"
                  }`}
                >
                  {hasSent ? (
                    <>
                      <Check className="size-3" /> Da gui
                    </>
                  ) : (
                    <>
                      <Send className="size-3" /> Gui
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <p className="py-4 text-center text-xs text-zinc-500">Khong tim thay nguoi dung nay.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
