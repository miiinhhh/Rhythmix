// Rhythmix.Application/UseCases/Search/Handlers/SearchQueryHandler.cs
using MediatR;
using Rhythmix.Application.DTOs.Search;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Search.Handlers;

public sealed class SearchQueryHandler : IRequestHandler<SearchQuery, SearchResponse>
{
    private readonly ISearchRepository _searchRepository;
    private readonly IPlaylistTrackRepository _playlistTrackRepository;
    private readonly IMediaRepository _mediaRepository;

    public SearchQueryHandler(
        ISearchRepository searchRepository, 
        IPlaylistTrackRepository playlistTrackRepository, 
        IMediaRepository mediaRepository)
    {
        _searchRepository = searchRepository;
        _playlistTrackRepository = playlistTrackRepository;
        _mediaRepository = mediaRepository;
    }

    public async Task<SearchResponse> Handle(SearchQuery request, CancellationToken cancellationToken)
    {
        var response = new SearchResponse();

        if (string.IsNullOrWhiteSpace(request.QueryText))
        {
            // Trả về trending
            return await GetTrendingAsync(request, cancellationToken);
        }

        // Tìm kiếm bài hát (theo title hoặc artist name)
        if (request.SearchType == SearchType.All || request.SearchType == SearchType.Media)
        {
            var (mediaItems, totalMedia) = await _searchRepository.SearchMediaAsync(
                request.QueryText, request.Page, request.PageSize);

            response.Media = mediaItems.Select(m => new SearchMediaDto
            {
                MediaId = m.MediaId,
                Title = m.Title,
                Description = m.Description,
                MediaType = m.MediaType,
                Duration = m.Duration,
                ThumbnailUrl = m.ThumbnailUrl ?? string.Empty,
                ArtistId = m.ArtistId,
                ArtistName = m.ArtistName,
                AlbumId = m.AlbumId,
                AlbumTitle = m.AlbumTitle,
                GenreId = m.GenreId,
                ViewCount = m.ViewCount,
                CreatedAt = m.CreatedAt,
                OwnerId = m.OwnerId
            }).ToList();


            response.Pagination.TotalItems = totalMedia;
        }

        // Tìm kiếm playlist theo tên hoặc tên chủ sở hữu
        if (request.SearchType == SearchType.All || request.SearchType == SearchType.Playlist)
        {
            var (playlists, totalPlaylists) = await _searchRepository.SearchPlaylistAsync(
                request.QueryText, request.Page, request.PageSize);

            var playlistDtos = new List<SearchPlaylistDto>();
            foreach (var playlist in playlists)
            {
                var coverUrl = await GetPlaylistCoverUrlAsync(playlist);
                playlistDtos.Add(new SearchPlaylistDto
                {
                    PlaylistId = playlist.Id,
                    Name = playlist.Name,
                    Description = playlist.Description,
                    IsPublic = playlist.IsPublic,
                    OwnerId = playlist.OwnerId,
                    CreatedAt = playlist.CreatedAt,
                    TrackCount = playlist.TrackCount,
                    CoverImageUrl = playlist.CoverImageUrl,
                    ThumbnailUrl = coverUrl
                });
            }
            response.Playlists = playlistDtos;

            if (request.SearchType == SearchType.All)
            {
                response.Pagination.TotalItems += totalPlaylists;
            }
            else
            {
                response.Pagination.TotalItems = totalPlaylists;
            }
        }

        // Tìm kiếm album theo tên hoặc tên chủ sở hữu/nghệ sĩ
        if (request.SearchType == SearchType.All || request.SearchType == SearchType.Album)
        {
            var (albums, totalAlbums) = await _searchRepository.SearchAlbumAsync(
                request.QueryText, request.Page, request.PageSize);

            response.Albums = albums.Select(a => new SearchAlbumDto
            {
                AlbumId = a.AlbumId,
                Title = a.Title,
                Description = a.Description,
                CoverImageUrl = a.CoverImageUrl,
                OwnerId = a.OwnerId,
                ArtistName = a.ArtistName,
                TrackCount = a.TrackCount,
                CreatedAt = a.CreatedAt
            }).ToList();

            if (request.SearchType == SearchType.All)
            {
                response.Pagination.TotalItems += totalAlbums;
            }
            else
            {
                response.Pagination.TotalItems = totalAlbums;
            }
        }

        if (request.SearchType == SearchType.All || request.SearchType == SearchType.Playlist)
        {
            var genrePlaylists = await _searchRepository.SearchGenrePlaylistsAsync(request.QueryText);
            response.GenrePlaylists = genrePlaylists
                .Select(MapGenrePlaylist)
                .Where(g => g.TrackCount > 0)
                .ToList();

            response.Pagination.TotalItems += response.GenrePlaylists.Count;
        }

        response.Pagination.Page = request.Page;
        response.Pagination.PageSize = request.PageSize;
        return response;
    }

    private static SearchMediaDto MapMedia(Rhythmix.Domain.Entities.MediaItem m) => new()
    {
        MediaId = m.MediaId,
        Title = m.Title,
        Description = m.Description,
        MediaType = m.MediaType,
        Duration = m.Duration,
        ThumbnailUrl = m.ThumbnailUrl ?? string.Empty,
        ArtistId = m.ArtistId,
        ArtistName = m.ArtistName,
        AlbumId = m.AlbumId,
        AlbumTitle = m.AlbumTitle,
        GenreId = m.GenreId,
        ViewCount = m.ViewCount,
        CreatedAt = m.CreatedAt,
        OwnerId = m.OwnerId
    };

    private static SearchGenrePlaylistDto MapGenrePlaylist(
        (Rhythmix.Domain.Entities.Genre Genre, IEnumerable<Rhythmix.Domain.Entities.MediaItem> Tracks) item)
    {
        var tracks = item.Tracks
            .Where(track => track.GenreId == item.Genre.GenreId)
            .Select(MapMedia)
            .ToList();

        // Lấy thumbnail của bài hát đầu tiên có thumbnail
        var coverImageUrl = tracks
            .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t.ThumbnailUrl))
            ?.ThumbnailUrl;

        return new SearchGenrePlaylistDto
        {
            GenreId = item.Genre.GenreId,
            Name = $"{item.Genre.Name} Mix",
            Description = item.Genre.Description ?? $"Playlist đề xuất theo thể loại {item.Genre.Name}",
            CoverImageUrl = coverImageUrl,
            TrackCount = tracks.Count,
            Tracks = tracks
        };
    }

    private async Task<SearchResponse> GetTrendingAsync(SearchQuery request, CancellationToken cancellationToken)
    {
        var response = new SearchResponse();

        // Lấy media trending
        var (mediaItems, totalMedia) = await _searchRepository.GetPublicMediaAsync(
            request.Page, request.PageSize);

        response.Media = mediaItems.Select(m => new SearchMediaDto
        {
            MediaId = m.MediaId,
            Title = m.Title,
            Description = m.Description,
            MediaType = m.MediaType,
            Duration = m.Duration,
            ThumbnailUrl = m.ThumbnailUrl ?? string.Empty,
            ArtistId = m.ArtistId,
            ArtistName = m.ArtistName,
            AlbumId = m.AlbumId,
            AlbumTitle = m.AlbumTitle,
            GenreId = m.GenreId,
            ViewCount = m.ViewCount,
            CreatedAt = m.CreatedAt,
            OwnerId = m.OwnerId
        }).ToList();

        // Lấy playlists mới nhất
        var (playlists, totalPlaylists) = await _searchRepository.GetPublicPlaylistsAsync(
            request.Page, request.PageSize);

        var playlistDtos = new List<SearchPlaylistDto>();
        foreach (var playlist in playlists)
        {
            var coverUrl = await GetPlaylistCoverUrlAsync(playlist);
            playlistDtos.Add(new SearchPlaylistDto
            {
                PlaylistId = playlist.Id,
                Name = playlist.Name,
                Description = playlist.Description,
                IsPublic = playlist.IsPublic,
                OwnerId = playlist.OwnerId,
                CreatedAt = playlist.CreatedAt,
                TrackCount = playlist.TrackCount,
                CoverImageUrl = playlist.CoverImageUrl,
                ThumbnailUrl = coverUrl
            });
        }
        response.Playlists = playlistDtos;

        // Lấy albums mới nhất
        var (albums, totalAlbums) = await _searchRepository.GetPublicAlbumsAsync(
            request.Page, request.PageSize);

        response.Albums = albums.Select(a => new SearchAlbumDto
        {
            AlbumId = a.AlbumId,
            Title = a.Title,
            Description = a.Description,
            CoverImageUrl = a.CoverImageUrl,
            OwnerId = a.OwnerId,
            ArtistName = a.ArtistName,
            TrackCount = a.TrackCount,
            CreatedAt = a.CreatedAt
        }).ToList();

        response.Pagination = new PaginationInfo
        {
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalMedia + totalPlaylists + totalAlbums
        };

        return response;
    }

    private async Task<string?> GetPlaylistCoverUrlAsync(Rhythmix.Domain.Entities.Playlist playlist)
    {
        // Nếu playlist đã có cover ảnh → dùng luôn
        if (!string.IsNullOrEmpty(playlist.CoverImageUrl))
        {
            return playlist.CoverImageUrl;
        }

        // Nếu không, lấy tracks của playlist
        var tracks = await _playlistTrackRepository.GetTracksAsync(playlist.Id);
        var firstTrack = tracks.FirstOrDefault();
        if (firstTrack == null)
        {
            return null;
        }

        // Lấy thông tin media item
        var media = await _mediaRepository.GetByIdAsync(firstTrack.MediaId);
        return media?.ThumbnailUrl;
    }
}
