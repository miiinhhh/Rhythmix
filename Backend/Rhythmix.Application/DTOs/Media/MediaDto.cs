// Rhythmix.Application/DTOs/Media/MediaDto.cs
namespace Rhythmix.Application.DTOs.Media;

public class MediaDto
{
    public Guid MediaId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public int Duration { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public Guid? AlbumId { get; set; }
    public Guid? GenreId { get; set; }
    public Guid OwnerId { get; set; }
    public bool IsPublic { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; }
}