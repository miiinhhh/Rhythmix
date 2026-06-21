import { mediaService } from "../api/mediaService";
import { API_BASE_URL } from "../config/apiConfig";
import type { MediaItemDto } from "../types/api";

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

const resolveUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }

  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${encodeURI(normalizedUrl)}`;
};

export const resolveAssetUrl = resolveUrl;

export const resolveArtistName = (artistName?: string, ownerName?: string, title?: string) => {
  if (artistName?.trim()) return artistName.trim();
  if (ownerName?.trim()) return ownerName.trim();

  const titlePrefix = title?.split("_")[0]?.trim();
  if (titlePrefix && titlePrefix !== title) return titlePrefix;

  return "Unknown artist";
};

export const mapMediaToSong = (media: MediaItemDto): SongType => {
  const mediaKind = (media.contentType || media.mimeType || media.mediaType || "")
    .toString()
    .toLowerCase()
    .trim();

  const isVideoMedia =
    mediaKind === "video" || mediaKind.startsWith("video/") || mediaKind.includes("mp4");
  const isAudioMedia =
    mediaKind === "audio" ||
    mediaKind.startsWith("audio/") ||
    mediaKind.includes("mpeg") ||
    mediaKind.includes("mp3") ||
    mediaKind.includes("wav");
  const streamUrl = mediaService.getMediaStream(media.mediaId);

  return {
    id: media.mediaId,
    title: media.title || "Unknown title",
    artist: resolveArtistName(media.artistName, media.ownerName, media.title),
    album: "Single",
    duration: formatDuration(media.duration),
    isLiked: false,
    url: streamUrl,
    videoUrl: isVideoMedia ? streamUrl : undefined,
    posterUrl: resolveUrl(media.thumbnailUrl),
    mediaType: isVideoMedia ? "video" : isAudioMedia ? "audio" : "audio",
  };
};
