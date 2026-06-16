// Rhythmix.Application/UseCases/Search/Handlers/SearchQueryHandler.cs
using MediatR;
using Rhythmix.Application.DTOs.Search;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Search.Handlers;

public sealed class SearchQueryHandler : IRequestHandler<SearchQuery, SearchResponse>
{
    private readonly ISearchRepository _searchRepository;

    public SearchQueryHandler(ISearchRepository searchRepository)
    {
        _searchRepository = searchRepository;
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
                GenreId = m.GenreId,
                ViewCount = m.ViewCount,
                CreatedAt = m.CreatedAt,
                OwnerId = m.OwnerId  
            }).ToList();

            response.Pagination.TotalItems = totalMedia;
        }

        // Tìm kiếm playlists (theo tên hoặc tên owner)
        if (request.SearchType == SearchType.All || request.SearchType == SearchType.Playlist)
        {
            var (playlists, totalPlaylists) = await _searchRepository.SearchPlaylistAsync(
                request.QueryText, request.Page, request.PageSize);

            response.Playlists = playlists.Select(p => new SearchPlaylistDto
            {
                PlaylistId = p.Id,
                Name = p.Name,
                Description = p.Description,
                IsPublic = p.IsPublic,
                OwnerId = p.OwnerId,
                CreatedAt = p.CreatedAt,
                TrackCount = 0
            }).ToList();

            if (request.SearchType == SearchType.All)
            {
                response.Pagination.TotalItems += totalPlaylists;
            }
            else
            {
                response.Pagination.TotalItems = totalPlaylists;
            }
        }

        response.Pagination.Page = request.Page;
        response.Pagination.PageSize = request.PageSize;

        return response;
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
            GenreId = m.GenreId,
            ViewCount = m.ViewCount,
            CreatedAt = m.CreatedAt,
            OwnerId = m.OwnerId
        }).ToList();

        // Lấy playlists mới nhất
        var (playlists, totalPlaylists) = await _searchRepository.GetPublicPlaylistsAsync(
            request.Page, request.PageSize);

        response.Playlists = playlists.Select(p => new SearchPlaylistDto
        {
            PlaylistId = p.Id,
            Name = p.Name,
            Description = p.Description,
            IsPublic = p.IsPublic,
            OwnerId = p.OwnerId,
            CreatedAt = p.CreatedAt
        }).ToList();

        response.Pagination = new PaginationInfo
        {
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalMedia + totalPlaylists
        };

        return response;
    }
}