namespace Rhythmix.Domain.Entities;

public class MediaItem
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
    public Guid? ArtistId { get; set; }
    public string ArtistName { get; set; } = string.Empty;
    public Guid? AlbumId { get; set; } 
    public string? AlbumTitle { get; set; }
    public Guid? GenreId { get; set; }
    public Guid OwnerId { get; set; }
    public bool IsPublic { get; set; } = true; 
    public int ViewCount { get; set; } = 0; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? VideoFilePath { get; set; }
    public string? VideoMimeType { get; set; }
    public long? VideoFileSize { get; set; }
}
