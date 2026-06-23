// Rhythmix.Domain/Entities/Album.cs
namespace Rhythmix.Domain.Entities;

public class Album
{
    public Guid AlbumId { get; set; }
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int TrackCount { get; set; }
    public string? ArtistName { get; set; }
    
    // Navigation properties
    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}