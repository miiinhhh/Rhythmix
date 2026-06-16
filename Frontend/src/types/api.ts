// ============ API Response Wrapper ============
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============ Auth DTOs ============
export interface AuthResponse {
  id: string;
  email: string;
  userName: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  token: string;
}

export interface RegisterRequest {
  email: string;
  userName: string;
  password: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ============ Media DTOs ============
export interface MediaItemDto {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  fileType: string; // "audio" | "video"
  isPublic: boolean;
  views?: number;
  likes?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadMediaDto {
  file: File;
  title: string;
  description?: string;
  isPublic?: boolean;
  albumId?: string;
}

// ============ Playlist DTOs ============
export interface PlaylistDto {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  coverUrl?: string;
  mediaCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePlaylistDto {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface PlaylistMediaDto {
  mediaId: string;
  playlistId: string;
}

// ============ User DTOs ============
export interface UserProfileDto {
  id: string;
  userName: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  followerCount?: number;
  followingCount?: number;
  playlistCount?: number;
  mediaCount?: number;
  createdAt?: string;
}

export interface UpdateProfileDto {
  id?: string;
  userName?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

// ============ Interaction DTOs ============
export interface InteractionDto {
  id: string;
  userId: string;
  mediaId: string;
  type: "like" | "view" | "share"; // interaction type
  createdAt: string;
}

export interface ToggleLikeDto {
  mediaId: string;
  isLiked: boolean;
}

// ============ Notification DTOs ============
export interface NotificationDto {
  id: string;
  userId: string;
  type: string; // "share_song", "share_playlist", "follow", etc.
  message: string;
  payload?: string;
  isRead: boolean;
  createdAt: string;
  relatedUserId?: string;
  relatedUserName?: string;
}

// ============ Follow DTOs ============
export interface FollowDto {
  followerId: string;
  followingId: string;
  createdAt: string;
}

// ============ Search Result ============
export interface SearchResultDto {
  mediaItems: MediaItemDto[];
  playlists: PlaylistDto[];
  users: UserProfileDto[];
}

