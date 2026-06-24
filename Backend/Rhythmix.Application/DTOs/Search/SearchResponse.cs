namespace Rhythmix.Application.DTOs.Search;

public sealed class SearchMediaDto
{
    public Guid MediaId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public int Duration { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;
    public Guid? ArtistId { get; set; }
    public string ArtistName { get; set; } = string.Empty;
    public Guid? AlbumId { get; set; }
    public string? AlbumTitle { get; set; }
    public Guid? GenreId { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid OwnerId { get; set; }
}

public sealed class SearchGenrePlaylistDto
{
    public Guid GenreId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public int TrackCount { get; set; }
    public List<SearchMediaDto> Tracks { get; set; } = new();
}

public sealed class SearchPlaylistDto
{
    public Guid PlaylistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public Guid OwnerId { get; set; }
    public int TrackCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
}

public sealed class SearchAlbumDto
{
    public Guid AlbumId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public Guid OwnerId { get; set; }
    public string? ArtistName { get; set; }
    public int TrackCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class PaginationInfo
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages => (TotalItems + PageSize - 1) / PageSize;
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}

public sealed class SearchResponse
{
    public List<SearchMediaDto> Media { get; set; } = new();
    public List<SearchPlaylistDto> Playlists { get; set; } = new();
    public List<SearchGenrePlaylistDto> GenrePlaylists { get; set; } = new();
    public List<SearchAlbumDto> Albums { get; set; } = new();
    public PaginationInfo Pagination { get; set; } = new();
}
