import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { notificationService } from "../api/notificationService";
import { signalRService } from "../api/signalRService";
import type { NotificationDto } from "../types/api";
import {formatTime } from "../utils/formatTime";

export interface Notification {
  id: string;
  receiverId: string;
  type: "follow" | "share_song" | "share_playlist" | "share_video";
  payload: string;
  time: string;
  isRead: boolean;
}

export interface InboxMessageType {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  avatarColor: string;
  sharedType: "song" | "video" | "playlist";
  trackData?: any;
  playlistData?: any;
  time: string;
}

interface NotificationContextType {
  notifications: Notification[];
  allMessages: InboxMessageType[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (newNoti: Notification) => void;
  addMessage: (newMsg: InboxMessageType) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  loadNotifications: () => Promise<void>;
}

const mapDtoToNotification = (dto: NotificationDto): Notification => {
  let type: Notification["type"] = "share_song";
  if (dto.type === "Follow") type = "follow";
  else if (dto.type === "PlaylistShare") type = "share_playlist";
  else if (dto.type === "MediaShare") type = "share_song";

  return {
    id: dto.id,
    receiverId: dto.userId,
    type,
    payload: dto.payload || dto.content || JSON.stringify({ message: dto.message }),
    time: formatTime(dto.createdAt),
    isRead: dto.isRead,
  };
};

export const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const currentUserId = localStorage.getItem("currentUserId") || "";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allMessages, setAllMessages] = useState<InboxMessageType[]>(() => {
    const saved = localStorage.getItem("app_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getUnreadCount = useCallback(
    (items: Notification[]) =>
      items.filter((n) => n.receiverId === currentUserId && !n.isRead).length,
    [currentUserId],
  );

  const persistNotifications = useCallback(
    (items: Notification[]) => {
      const unread = getUnreadCount(items);
      localStorage.setItem("app_notifications", JSON.stringify(items));
      localStorage.setItem("app_unreadCount", String(unread));
      setUnreadCount(unread);
    },
    [getUnreadCount],
  );

  const markLocalAsRead = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          idSet.has(n.id) ? { ...n, isRead: true } : n,
        );
        persistNotifications(updated);
        return updated;
      });
    },
    [persistNotifications],
  );

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getAll();
      const mapped = data.map(mapDtoToNotification);
      setNotifications(mapped);
      persistNotifications(mapped);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      const saved = localStorage.getItem("app_notifications");
      if (saved) {
        const parsed = JSON.parse(saved) as Notification[];
        setNotifications(parsed);
        persistNotifications(parsed);
      }
    } finally {
      setIsLoading(false);
    }
  }, [persistNotifications]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    signalRService.connect(token);

    const unsubscribe = signalRService.onNotification((data) => {
      const newNoti: Notification = {
        id: data.id || data.Id || Date.now().toString(),
        receiverId: data.userId || data.UserId || currentUserId,
        type:
          data.type === "Follow"
            ? "follow"
            : data.type === "PlaylistShare"
              ? "share_playlist"
              : "share_song",
        payload: data.payload || data.Payload || JSON.stringify(data),
        time: data.createdAt || data.CreatedAt || new Date().toISOString(),
        isRead: false,
      };
      addNotification(newNoti);
    });

    loadNotifications();

    return () => {
      unsubscribe?.();
    };
  }, [currentUserId, loadNotifications]);

  const addNotification = useCallback(
    (newNoti: Notification) => {
      setNotifications((prev) => {
        const isDuplicate = prev.some((n) => n.id === newNoti.id);
        if (isDuplicate) return prev;

        const updated = [newNoti, ...prev];
        persistNotifications(updated);
        return updated;
      });
    },
    [persistNotifications],
  );

  const addMessage = useCallback((newMsg: InboxMessageType) => {
    setAllMessages((prev) => {
      const updated = [newMsg, ...prev];
      localStorage.setItem("app_messages", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadNotis = notifications.filter(
      (n) => n.receiverId === currentUserId && !n.isRead,
    );
    const unreadIds = unreadNotis.map((n) => n.id);

    markLocalAsRead(unreadIds);

    try {
      await Promise.all(unreadNotis.map((n) => notificationService.markAsRead(n.id)));
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      await loadNotifications();
    }
  }, [notifications, currentUserId, markLocalAsRead, loadNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      markLocalAsRead([id]);

      try {
        await notificationService.markAsRead(id);
        await loadNotifications();
      } catch (error) {
        console.error("Failed to mark as read:", error);
        await loadNotifications();
      }
    },
    [markLocalAsRead, loadNotifications],
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "app_notifications") {
        const saved = localStorage.getItem("app_notifications");
        if (saved) {
          const parsed = JSON.parse(saved) as Notification[];
          setNotifications(parsed);
          setUnreadCount(getUnreadCount(parsed));
        }
      }

      if (e.key === "app_messages") {
        const saved = localStorage.getItem("app_messages");
        if (saved) setAllMessages(JSON.parse(saved));
      }

      if (e.key === "app_unreadCount") {
        const saved = localStorage.getItem("app_unreadCount");
        if (saved) setUnreadCount(parseInt(saved, 10));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [getUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        allMessages,
        unreadCount,
        isLoading,
        addNotification,
        addMessage,
        setNotifications,
        markAllAsRead,
        markAsRead,
        loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
};
