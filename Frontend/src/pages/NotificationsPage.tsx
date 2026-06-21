// src/pages/NotificationPage.tsx
import { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { BellOff, Disc, Music, Radio, UserPlus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatTime} from "../utils/formatTime";

const NotificationPage = () => {
  const { notifications, markAsRead, markAllAsRead, loadNotifications, isLoading } = useNotifications();

  const currentUserId = localStorage.getItem("currentUserId") || "";
  const myNotifications = notifications.filter((n) => n.receiverId === currentUserId);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const parseNotificationContent = (type: string, payloadStr: string) => {
    try {
      const data = JSON.parse(payloadStr);
      switch (type) {
        case "follow":
          return { 
            title: "New follower", 
            description: `${data.SenderName || data.FollowerName} started following you.` 
          };
        case "share_song":
          return { 
            title: "Someone shared a song", 
            description: `${data.SenderName} sent you '${data.MediaTitle}'.` 
          };
        case "share_playlist":
          return { 
            title: "Someone shared a playlist", 
            description: `${data.SenderName} shared '${data.PlaylistName}'.` 
          };
        case "share_video":
          return { 
            title: "New video shared", 
            description: `${data.SenderName} shared the video '${data.MediaTitle}'.` 
          };
        default:
          return { title: "Update", description: "You have a new update." };
      }
    } catch {
      return { title: "Notification", description: "..." };
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const getIconDetails = (type: string) => {
    if (type === "follow")
      return { icon: <UserPlus className="size-5 text-emerald-500" />, bgColor: "bg-emerald-500/10" };
    if (type === "share_song")
      return { icon: <Music className="size-5 text-blue-500" />, bgColor: "bg-blue-500/10" };
    if (type === "share_playlist")
      return { icon: <Radio className="size-5 text-green-500" />, bgColor: "bg-green-500/10" };
    return { icon: <Disc className="size-5 text-purple-500" />, bgColor: "bg-purple-500/10" };
  };

  const navigate = useNavigate();

  const handleNotificationClick = (item: any) => {
    handleMarkAsRead(item.id);
    try {
      const data = JSON.parse(item.payload);
      if (item.type === "follow") {
        navigate(`/profile/${data.senderId || data.FollowerId}`);
      } else {
        navigate(`/inbox?highlight=${data.itemId || data.shareId}`);
      }
    } catch (e) {
      console.error("Lỗi khi chuyển hướng:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2 className="size-6 animate-spin" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Notifications</h1>
          <p className="mt-2 text-sm text-zinc-400 font-medium">Stay up to date with new releases and activity.</p>
        </div>
        {myNotifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:scale-105 transition-transform cursor-pointer"
            type="button"
          >
            Mark all as read
          </button>
        )}
      </div>

      {myNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-zinc-800 rounded-lg text-zinc-500">
          <div className="bg-zinc-900 p-4 rounded-full mb-4">
            <BellOff size={32} className="text-zinc-600" />
          </div>
          <p className="font-medium">Chưa có thông báo nào mới.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myNotifications.map((item) => {
            const { icon, bgColor } = getIconDetails(item.type);
            const { title, description } = parseNotificationContent(item.type, item.payload);

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
                  !item.isRead ? 'bg-[#1a1a1a] border border-zinc-700' : 'bg-[#121212] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex gap-4 items-center flex-1 min-w-0">
                  <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                    {icon}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className={`text-sm font-bold truncate ${!item.isRead ? "text-white" : "text-zinc-500"}`}>
                      {title}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate font-medium">{description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {!item.isRead && <span className="size-2 bg-green-500 rounded-full animate-pulse" />}
                  <span className="text-xs text-zinc-400 font-medium">{formatTime(item.time)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;