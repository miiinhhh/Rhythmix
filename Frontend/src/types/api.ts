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
  mediaId: string;
  title: string;
  description?: string;
  mediaType: string;
  duration: number;
  filePath: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize?: number;
  artistId?: string;
  artistName?: string;
  albumId?: string;
  genreId?: string;
  ownerId: string;
  ownerName?: string;
  isPublic?: boolean;
  viewCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadMediaDto {
  file: File;
  coverImage?: File;
  title: string;
  artistName?: string;
  description?: string;
  isPublic?: boolean;
  albumId?: string;
  genreId?: string;
}

// ============ Genre DTOs ============
export interface GenreDto {
  genreId: string;
  name: string;
  description?: string;
}

export interface ArtistDto {
  artistId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  createdAt?: string;
  trackCount?: number;
  followerCount?: number;
}

// ============ Album DTOs ============
export interface AlbumDto {
  albumId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  releaseDate?: string;
  createdAt: string;
  ownerId: string;
  trackCount: number;
}

export interface AlbumDetailDto extends AlbumDto {
  tracks: MediaItemDto[];
}

export interface CreateAlbumDto {
  title: string;
  description?: string;
  coverImageUrl?: string;
  releaseDate?: string;
}

// ============ Playlist DTOs ============
export interface PlaylistDto {
  playlistId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerId: string;
  trackCount?: number;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface PlaylistTrackDto {
  mediaId: string;
  sortOrder: number;
  title: string;
  artistName?: string;
  filePath: string;
  thumbnailUrl?: string;
  duration: number;
}

export interface PlaylistDetailDto extends PlaylistDto {
  tracks: PlaylistTrackDto[];
}

export interface CreatePlaylistDto {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: File;
}

export interface PlaylistMediaDto {
  mediaId: string;
  playlistId: string;
  sortOrder?: number;
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

// ============ Share DTOs ============
export interface ShareItemDto {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  mediaId?: string;
  mediaTitle?: string;
  mediaType?: "audio" | "video" | string;
  playlistId?: string;
  playlistName?: string;
  message?: string;
  sharedAt: string;
}

export interface CreateShareDto {
  receiverId: string;
  mediaId?: string;
  playlistId?: string;
  message?: string;
}

// ============ Search Result ============
export interface SearchMediaDto {
  mediaId: string;
  title: string;
  description?: string;
  mediaType: string;
  duration: number;
  thumbnailUrl?: string;
  artistId?: string;
  artistName?: string;
  genreId?: string;
  viewCount: number;
  createdAt: string;
  ownerId: string;
}

export interface SearchPlaylistDto {
  playlistId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerId: string;
  trackCount: number;
  createdAt: string;
}

export interface SearchGenrePlaylistDto {
  genreId: string;
  name: string;
  description?: string;
  trackCount: number;
  tracks: SearchMediaDto[];
}

export interface SearchResultDto {
  media: SearchMediaDto[];
  playlists: SearchPlaylistDto[];
  genrePlaylists: SearchGenrePlaylistDto[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

