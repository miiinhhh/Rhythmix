import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface Notification {
  id: string;
  receiverId: string;
  type: 'follow' | 'share_song' | 'share_playlist' | 'share_video';
  payload: string;
  time: string;
  isRead: boolean;
}

// Thêm interface cho tin nhắn
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
  allMessages: InboxMessageType[]; // Quản lý thêm tin nhắn
  addNotification: (newNoti: Notification) => void;
  addMessage: (newMsg: InboxMessageType) => void; // Hàm mới để thêm tin nhắn
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const currentUserId = localStorage.getItem("currentUserId") || "user-alex";

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("app_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  const [allMessages, setAllMessages] = useState<InboxMessageType[]>(() => {
    const saved = localStorage.getItem("app_messages");
    return saved ? JSON.parse(saved) : [];
  });

  const addNotification = (newNoti: Notification) => {
    setNotifications((prev) => {
      const isDuplicate = prev.some(n => n.id === newNoti.id);
      if (isDuplicate) return prev;
      
      const updated = [newNoti, ...prev];
      localStorage.setItem("app_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const addMessage = (newMsg: InboxMessageType) => {
    setAllMessages((prev) => {
      const updated = [newMsg, ...prev];
      localStorage.setItem("app_messages", JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => n.receiverId === currentUserId ? { ...n, isRead: true } : n);
      localStorage.setItem("app_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  // Lắng nghe thay đổi giữa các tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "app_notifications") {
        const saved = localStorage.getItem("app_notifications");
        if (saved) setNotifications(JSON.parse(saved));
      }
      if (e.key === "app_messages") {
        const saved = localStorage.getItem("app_messages");
        if (saved) setAllMessages(JSON.parse(saved));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
        notifications, 
        allMessages, 
        addNotification, 
        addMessage,
        setNotifications, 
        markAllAsRead 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications phải nằm trong NotificationProvider");
  return context;
};