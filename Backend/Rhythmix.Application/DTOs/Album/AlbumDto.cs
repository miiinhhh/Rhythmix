
using Rhythmix.Application.DTOs.Media;

namespace Rhythmix.Application.DTOs.Album;

public class AlbumDto
{
    public Guid AlbumId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid OwnerId { get; set; }
    public int TrackCount { get; set; }
}

public class AlbumDetailDto : AlbumDto
{
    public List<MediaDto> Tracks { get; set; } = new();
}

public class CreateAlbumRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime? ReleaseDate { get; set; }
}

public class UpdateAlbumRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime? ReleaseDate { get; set; }
}