import { mediaService } from "../api/mediaService";
import type { MediaItemDto } from "../types/api";
import { API_BASE_URL } from "../config/apiConfig";


export interface SongType {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
  videoUrl?: string;
  posterUrl?: string;
  mediaType: string;
}

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const resolveAssetUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
};

export const resolveArtistName = (artistName?: string, ownerName?: string, title?: string) => {
  if (artistName?.trim()) return artistName.trim();
  if (ownerName?.trim()) return ownerName.trim();

  const titlePrefix = title?.split("_")[0]?.trim();
  if (titlePrefix && titlePrefix !== title) return titlePrefix;

  return "Unknown artist";
};

export const mapMediaToSong = (media: MediaItemDto): SongType => {
  const mediaType = media.mediaType?.toLowerCase() || "audio";
  const streamUrl = mediaService.getMediaStream(media.mediaId);

  return {
    id: media.mediaId,
    title: media.title,
    artist: resolveArtistName(media.artistName, media.ownerName, media.title),
    album: "Single",
    duration: formatDuration(media.duration),
    isLiked: false,
    url: streamUrl,
    videoUrl: mediaType === "video" ? streamUrl : undefined,
    posterUrl: resolveAssetUrl(media.thumbnailUrl),
    mediaType,
  };
};
