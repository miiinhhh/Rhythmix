import { create } from 'zustand';
import { type Notification } from '../types/database';

interface NotificationState {
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  setNotifications: (n: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications] })),
  setNotifications: (n) => set({ notifications: n }),
}));