<<<<<<< HEAD
export interface MediaItem {
  mediaId: string;
  title: string;
  mediaType: 'audio' | 'video';
  filePath: string;
  ownerId: string;
  viewCount: number;
}

export interface Notification {
  notificationId: string;
  userId: string;
  payload: string;
  isRead: boolean;
  createdAt: string;
=======
export interface MediaItem {
  mediaId: string;
  title: string;
  mediaType: 'audio' | 'video';
  filePath: string;
  ownerId: string;
  viewCount: number;
}

export interface Notification {
  notificationId: string;
  userId: string;
  payload: string;
  isRead: boolean;
  createdAt: string;
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
}