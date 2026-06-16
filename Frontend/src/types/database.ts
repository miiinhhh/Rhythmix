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
}