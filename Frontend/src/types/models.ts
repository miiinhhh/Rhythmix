<<<<<<< HEAD
// Ví dụ map từ file schema.sql
export interface User {
  id: string;
  userName: string;
  email: string;
  createdAt: string;
}

export interface MediaItem {
  mediaId: string;
  title: string;
  mediaType: 'audio' | 'video'; // Theo schema của bạn
  filePath: string;
  ownerId: string;
  viewCount: number;
=======
// Ví dụ map từ file schema.sql
export interface User {
  id: string;
  userName: string;
  email: string;
  createdAt: string;
}

export interface MediaItem {
  mediaId: string;
  title: string;
  mediaType: 'audio' | 'video'; // Theo schema của bạn
  filePath: string;
  ownerId: string;
  viewCount: number;
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
}