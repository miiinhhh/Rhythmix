import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, ListMusic, Mic2, Play, Search } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { artistService } from "../api/artistService";
import { followService } from "../api/followService";
import { searchService } from "../api/searchService";
import { userService } from "../api/userService";
import type { ArtistDto, MediaItemDto, SearchAlbumDto, SearchGenrePlaylistDto, SearchMediaDto, SearchPlaylistDto, UserProfileDto } from "../types/api";
import { mapMediaToSong, resolveArtistName, type SongType } from "../utils/mediaMapping";
import { API_BASE_URL } from "../config/apiConfig";

interface OutletContextType {
  setCurrentSongId: (id: string | null) => void;
  setIsPlaying: (v: boolean) => void;
  songs: SongType[];
  setSongs: React.Dispatch<React.SetStateAction<SongType[]>>;
}

const browseCategories = [
  { label: "Pop", color: "oklch(0.62 0.17 145)" },
  { label: "Rock", color: "oklch(0.6 0.18 25)" },
  { label: "Indie", color: "oklch(0.55 0.16 280)" },
  { label: "Alternative", color: "oklch(0.6 0.15 200)" },
  { label: "Electronic", color: "oklch(0.58 0.18 60)" },
];


const formatDuration = (seconds?: number) => {
  if (!seconds || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const resolveAssetUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  return `${API_BASE_URL}${url}`;
};

const mapSearchMediaToSong = (media: SearchMediaDto): SongType => {
  const mediaType = media.mediaType?.toLowerCase() || "audio";
  const streamUrl = `${API_BASE_URL}/api/media/${media.mediaId}/stream`;

  let albumName: string;
  if (!media.albumId) {
    // Definitely a single
    albumName = "Single";
  } else {
    // Has albumId, check for albumTitle
    if (media.albumTitle && media.albumTitle.trim() !== "") {
      // Only use "Album [title]" if title is valid
      albumName = `Album ${media.albumTitle}`;
    } else {
      // Fallback if no valid album title
      albumName = "Album Track";
    }
  }

  return {
    id: media.mediaId,
    title: media.title,
    artist: resolveArtistName(media.artistName, undefined, media.title),
    album: albumName,
    duration: formatDuration(media.duration),
    isLiked: false,
    url: streamUrl,
    videoUrl: mediaType === "video" ? streamUrl : undefined,
    posterUrl: resolveAssetUrl(media.thumbnailUrl),
    mediaType,
  };
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserProfileDto[]>([]);
  const [mediaResults, setMediaResults] = useState<SearchMediaDto[]>([]);
  const [playlistResults, setPlaylistResults] = useState<SearchPlaylistDto[]>([]);
  const [albumResults, setAlbumResults] = useState<SearchAlbumDto[]>([]);
  const [genrePlaylists, setGenrePlaylists] = useState<SearchGenrePlaylistDto[]>([]);
  const [artistResults, setArtistResults] = useState<ArtistDto[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistDto | null>(null);
  const [artistTracks, setArtistTracks] = useState<MediaItemDto[]>([]);
  const [isLoadingArtistTracks, setIsLoadingArtistTracks] = useState(false);
  const [isUploadingArtistCover, setIsUploadingArtistCover] = useState(false);
  const [followedArtistIds, setFollowedArtistIds] = useState<Record<string, boolean>>({});
  const artistCoverInputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { setCurrentSongId, setIsPlaying, songs, setSongs } = useOutletContext<OutletContextType>();

  useEffect(() => {
    userService.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const hasQuery = normalizedQuery.length > 0;

  useEffect(() => {
    if (!hasQuery) {
      setMediaResults([]);
      setPlaylistResults([]);
      setAlbumResults([]);
      setGenrePlaylists([]);
      setArtistResults([]);
      setSelectedArtist(null);
      setArtistTracks([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const [result, artists] = await Promise.all([
          searchService.search(query.trim()),
          artistService.search(query.trim()),
        ]);
        setMediaResults(result.media || []);
        setPlaylistResults(result.playlists || []);
        setAlbumResults(result.albums || []);
        setGenrePlaylists(result.genrePlaylists || []);
        setArtistResults(artists || []);
      } catch {
        setMediaResults([]);
        setPlaylistResults([]);
        setAlbumResults([]);
        setGenrePlaylists([]);
        setArtistResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [hasQuery, query]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        (user.displayName || user.userName || user.email).toLowerCase().includes(normalizedQuery)
      ),
    [normalizedQuery, users]
  );

  const playSong = (media: SearchMediaDto) => {
    const song = mapSearchMediaToSong(media);
    setSongs((current) => (current.some((item) => item.id === song.id) ? current : [song, ...current]));
    setCurrentSongId(song.id);
    setIsPlaying(true);
  };

  useEffect(() => {
    const artistIds = Array.from(
      new Set([
        ...mediaResults.map((item) => item.artistId).filter(Boolean),
        ...artistResults.map((item) => item.artistId).filter(Boolean),
        selectedArtist?.artistId,
      ].filter(Boolean))
    ) as string[];
    if (artistIds.length === 0) return;

    let cancelled = false;
    const loadStatuses = async () => {
      const entries = await Promise.all(
        artistIds.map(async (artistId) => {
          try {
            return [artistId, await followService.isFollowingArtist(artistId)] as const;
          } catch {
            return [artistId, false] as const;
          }
        })
      );

      if (!cancelled) {
        setFollowedArtistIds((current) => ({ ...current, ...Object.fromEntries(entries) }));
      }
    };

    void loadStatuses();
    return () => {
      cancelled = true;
    };
  }, [artistResults, mediaResults, selectedArtist]);

  const toggleArtistFollow = async (artistId?: string) => {
    if (!artistId) return;

    const previous = followedArtistIds[artistId] ?? false;
    setFollowedArtistIds((current) => ({ ...current, [artistId]: !previous }));

    try {
      const result = await followService.toggleArtist(artistId);
      const next = result?.isFollowing ?? result?.IsFollowing ?? !previous;
      setFollowedArtistIds((current) => ({ ...current, [artistId]: next }));
    } catch {
      setFollowedArtistIds((current) => ({ ...current, [artistId]: previous }));
    }
  };

  const openArtist = async (artist: ArtistDto) => {
    setSelectedArtist(artist);
    setIsLoadingArtistTracks(true);
    try {
      const tracks = await artistService.getMedia(artist.artistId);
      setArtistTracks(tracks || []);
    } catch {
      setArtistTracks([]);
    } finally {
      setIsLoadingArtistTracks(false);
    }
  };

  const playArtistTrack = (media: MediaItemDto) => {
    const song = mapMediaToSong(media);
    setSongs((current) => (current.some((item) => item.id === song.id) ? current : [song, ...current]));
    setCurrentSongId(song.id);
    setIsPlaying(true);
  };

  const uploadSelectedArtistCover = async (file?: File) => {
    if (!file || !selectedArtist) return;

    setIsUploadingArtistCover(true);
    try {
      const coverImageUrl = await artistService.uploadCover(selectedArtist.artistId, file);
      const updatedArtist = { ...selectedArtist, coverImageUrl };
      setSelectedArtist(updatedArtist);
      setArtistResults((current) =>
        current.map((artist) => (artist.artistId === selectedArtist.artistId ? updatedArtist : artist))
      );
    } finally {
      setIsUploadingArtistCover(false);
      if (artistCoverInputRef.current) artistCoverInputRef.current.value = "";
    }
  };

  const playGenrePlaylist = (playlist: SearchGenrePlaylistDto) => {
    const playlistSongs = playlist.tracks
      .filter((track) => track.genreId === playlist.genreId)
      .map((track) => ({
        ...mapSearchMediaToSong(track),
        album: playlist.name,
      }));

    if (playlistSongs.length === 0) return;

    const playlistSongIds = new Set(playlistSongs.map((song) => song.id));
    setSongs((current) => [...playlistSongs, ...current.filter((song) => !playlistSongIds.has(song.id))]);
    setCurrentSongId(playlistSongs[0].id);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Search</h1>
        <p className="mt-1 text-pretty text-sm text-zinc-400">Find songs and genre mixes uploaded to Rhythmix.</p>
      </div>

      <section>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song, artist, or genre"
            className="w-full rounded-full border border-zinc-800 bg-zinc-800/50 py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {hasQuery ? (
          <div className="mt-4 space-y-6">
            {isSearching && <p className="text-sm text-zinc-400">Searching...</p>}

            {genrePlaylists.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Genre playlists</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {genrePlaylists.map((playlist) => (
                    <button
                      key={playlist.genreId}
                      type="button"
                      onClick={() => playGenrePlaylist(playlist)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-left hover:bg-zinc-800"
                    >
                      <div className="flex size-12 items-center justify-center rounded-md bg-green-500/15 text-green-400">
                        <ListMusic className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{playlist.name}</div>
                        <div className="truncate text-xs text-zinc-400">{playlist.trackCount} songs</div>
                      </div>
                      <Play className="size-4 text-zinc-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {artistResults.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Artists</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {artistResults.map((artist) => {
                    const avatarUrl = resolveAssetUrl(artist.avatarUrl);
                    const coverUrl = resolveAssetUrl(artist.coverImageUrl);
                    return (
                      <div
                        key={artist.artistId}
                        onClick={() => void openArtist(artist)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 hover:bg-zinc-800"
                        style={coverUrl ? { backgroundImage: `linear-gradient(to right, rgba(24,24,27,.92), rgba(24,24,27,.72)), url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={artist.name} className="size-12 rounded-full object-cover" />
                        ) : (
                          <div className="flex size-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                            <Mic2 className="size-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-white">{artist.name}</div>
                          <div className="truncate text-xs text-zinc-400">
                            {artist.trackCount ?? 0} songs - {artist.followerCount ?? 0} followers
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void toggleArtistFollow(artist.artistId);
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                            followedArtistIds[artist.artistId]
                              ? "bg-zinc-700 text-white"
                              : "bg-white text-black hover:bg-zinc-200"
                          }`}
                        >
                          {followedArtistIds[artist.artistId] ? "Following" : "Follow"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedArtist && (
              <div>
                <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60">
                  <div
                    className="flex min-h-36 items-end justify-between gap-4 bg-zinc-800 p-4"
                    style={
                      selectedArtist.coverImageUrl
                        ? {
                            backgroundImage: `linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,.25)), url(${resolveAssetUrl(selectedArtist.coverImageUrl)})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    <div className="min-w-0">
                      <div className="mb-2 flex size-14 items-center justify-center overflow-hidden rounded-full bg-zinc-900/70 text-zinc-300">
                        {selectedArtist.avatarUrl ? (
                          <img src={resolveAssetUrl(selectedArtist.avatarUrl)} alt={selectedArtist.name} className="size-full object-cover" />
                        ) : (
                          <Mic2 className="size-7" />
                        )}
                      </div>
                      <h2 className="truncate text-2xl font-black tracking-tight text-white">{selectedArtist.name}</h2>
                      <p className="mt-1 text-xs font-semibold text-zinc-300">
                        {selectedArtist.trackCount ?? artistTracks.length} songs - {selectedArtist.followerCount ?? 0} followers
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <input
                        ref={artistCoverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => void uploadSelectedArtistCover(event.target.files?.[0])}
                      />
                      <button
                        type="button"
                        onClick={() => artistCoverInputRef.current?.click()}
                        disabled={isUploadingArtistCover}
                        className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-zinc-200 disabled:opacity-60"
                      >
                        <ImagePlus className="size-4" />
                        {isUploadingArtistCover ? "Uploading" : "Cover"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleArtistFollow(selectedArtist.artistId)}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                          followedArtistIds[selectedArtist.artistId] ? "bg-zinc-700 text-white" : "bg-green-500 text-black"
                        }`}
                      >
                        {followedArtistIds[selectedArtist.artistId] ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    {selectedArtist.name} songs
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArtist(null);
                      setArtistTracks([]);
                    }}
                    className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
                  >
                    Close
                  </button>
                </div>
                {isLoadingArtistTracks ? (
                  <p className="text-sm text-zinc-400">Loading songs...</p>
                ) : artistTracks.length === 0 ? (
                  <p className="text-sm text-zinc-400">No public songs from this artist yet.</p>
                ) : (
                  <div className="space-y-2">
                    {artistTracks.map((track) => {
                      const song = mapMediaToSong(track);
                      return (
                        <button
                          key={track.mediaId}
                          type="button"
                          onClick={() => playArtistTrack(track)}
                          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-left hover:bg-zinc-800"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">{song.title}</div>
                            <div className="truncate text-xs text-zinc-400">{song.artist}</div>
                          </div>
                          <span className="text-xs text-zinc-500">{song.duration}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {playlistResults.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Playlists</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {playlistResults.map((playlist) => (
                    <button
                      key={playlist.playlistId}
                      type="button"
                      onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-left hover:bg-zinc-800"
                    >
                      <div className="flex size-12 items-center justify-center rounded-md bg-zinc-800 text-zinc-400">
                        <ListMusic className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{playlist.name}</div>
                        <div className="truncate text-xs text-zinc-400">
                          {playlist.trackCount} songs - {playlist.isPublic ? "Public" : "Private"}
                        </div>
                      </div>
                      <Play className="size-4 text-zinc-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {albumResults.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Albums</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {albumResults.map((album) => (
                    <button
                      key={album.albumId}
                      type="button"
                      onClick={() => navigate(`/album/${album.albumId}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-left hover:bg-zinc-800"
                    >
                      {album.coverImageUrl ? (
                        <img 
                          src={resolveAssetUrl(album.coverImageUrl)} 
                          alt={album.title} 
                          className="size-12 rounded-md object-cover" 
                        />
                      ) : (
                        <div className="flex size-12 items-center justify-center rounded-md bg-zinc-800 text-zinc-400">
                          <ListMusic className="size-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{album.title}</div>
                        <div className="truncate text-xs text-zinc-400">
                          {album.trackCount} songs - {album.artistName || "Unknown Artist"}
                        </div>
                      </div>
                      <Play className="size-4 text-zinc-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredUsers.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Users</h2>
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 hover:bg-zinc-800"
                    >
                      {resolveAssetUrl(user.avatarUrl) ? (
                        <img
                          src={resolveAssetUrl(user.avatarUrl)}
                          alt={user.displayName || user.userName || user.email}
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-white">
                          {(user.displayName || user.userName || user.email).slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-white">{user.displayName || user.userName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mediaResults.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold tracking-tight text-white">Songs</h2>
                <div className="space-y-2">
                  {mediaResults.map((media) => {
                    const song = songs.find((item) => item.id === media.mediaId) || mapSearchMediaToSong(media);
                    return (
                      <div
                        key={media.mediaId}
                        onClick={() => playSong(media)}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 hover:bg-zinc-800"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">{song.title}</div>
                          <div className="truncate text-xs text-zinc-400">{song.artist} - {song.album}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          {media.artistId && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void toggleArtistFollow(media.artistId);
                              }}
                              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                                followedArtistIds[media.artistId]
                                  ? "bg-zinc-800 text-white"
                                  : "bg-white text-black hover:bg-zinc-200"
                              }`}
                            >
                              {followedArtistIds[media.artistId] ? "Following" : "Follow Artist"}
                            </button>
                          )}
                          <span className="text-xs text-zinc-500">{song.duration}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isSearching && mediaResults.length === 0 && playlistResults.length === 0 && albumResults.length === 0 && genrePlaylists.length === 0 && artistResults.length === 0 && filteredUsers.length === 0 && (
              <p className="text-sm text-zinc-400">No results found.</p>
            )}
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-white">Browse genres</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {browseCategories.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setQuery(cat.label)}
                  className="relative flex aspect-[1.6/1] cursor-pointer items-end overflow-hidden rounded-lg p-4 text-left transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: cat.color }}
                >
                  <span className="text-base font-bold text-black">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
