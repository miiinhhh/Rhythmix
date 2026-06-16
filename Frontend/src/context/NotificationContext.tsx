import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
<<<<<<< HEAD
import { signalRService } from "../api/signalRService";
=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece

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
<<<<<<< HEAD
  unreadCount: number; // Badge count for unread notifications
=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
  addNotification: (newNoti: Notification) => void;
  addMessage: (newMsg: InboxMessageType) => void; // Hàm mới để thêm tin nhắn
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const currentUserId = localStorage.getItem("currentUserId") || "user-alex";
<<<<<<< HEAD
  const token = localStorage.getItem("token");
=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("app_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  const [allMessages, setAllMessages] = useState<InboxMessageType[]>(() => {
    const saved = localStorage.getItem("app_messages");
    return saved ? JSON.parse(saved) : [];
  });

<<<<<<< HEAD
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    const saved = localStorage.getItem("app_unreadCount");
    return saved ? parseInt(saved) : 0;
  });

=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
  const addNotification = (newNoti: Notification) => {
    setNotifications((prev) => {
      const isDuplicate = prev.some(n => n.id === newNoti.id);
      if (isDuplicate) return prev;
      
      const updated = [newNoti, ...prev];
      localStorage.setItem("app_notifications", JSON.stringify(updated));
<<<<<<< HEAD
      
      // Update unread count
      if (!newNoti.isRead) {
        setUnreadCount(prev => {
          const newCount = prev + 1;
          localStorage.setItem("app_unreadCount", String(newCount));
          return newCount;
        });
      }
      
=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
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
<<<<<<< HEAD
      setUnreadCount(0);
      localStorage.setItem("app_unreadCount", "0");
=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
      return updated;
    });
  };

<<<<<<< HEAD
  // SignalR integration - connect when user is authenticated
  useEffect(() => {
    if (!token || !signalRService.isConnected()) {
      return;
    }

    // Subscribe to real-time notifications from SignalR
    const unsubscribeNotification = signalRService.onNotification((notification: any) => {
      console.log('📬 Received notification via SignalR:', notification);
      addNotification({
        id: notification.id || `noti_${Date.now()}`,
        receiverId: currentUserId,
        type: notification.type || 'follow',
        payload: notification.payload || JSON.stringify(notification),
        time: new Date().toISOString(),
        isRead: false,
      });
    });

    // Subscribe to unread count changes
    const unsubscribeUnreadCount = signalRService.onUnreadCountChanged((count: number) => {
      console.log('🔔 Unread count from server:', count);
      setUnreadCount(count);
      localStorage.setItem("app_unreadCount", String(count));
    });

    return () => {
      unsubscribeNotification();
      unsubscribeUnreadCount();
    };
  }, [token, currentUserId]);

=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
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
<<<<<<< HEAD
      if (e.key === "app_unreadCount") {
        const saved = localStorage.getItem("app_unreadCount");
        if (saved) setUnreadCount(parseInt(saved));
      }
=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
        notifications, 
        allMessages, 
<<<<<<< HEAD
        unreadCount,
=======
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
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