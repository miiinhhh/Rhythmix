namespace Rhythmix.Application.DTOs.Playlist;

public class PlaylistSummaryDto
{
    public Guid PlaylistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public int TrackCount { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}