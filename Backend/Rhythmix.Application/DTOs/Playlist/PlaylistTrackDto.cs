namespace Rhythmix.Application.DTOs.Playlist;

public class PlaylistTrackDto
{
    public Guid MediaId { get; set; }
    public int SortOrder { get; set; }
    
    public string Title { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public int Duration { get; set; }
}