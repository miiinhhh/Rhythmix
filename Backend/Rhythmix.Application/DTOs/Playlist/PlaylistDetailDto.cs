namespace Rhythmix.Application.DTOs.Playlist;

public class PlaylistDetailDto  
{
    public Guid PlaylistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public List<PlaylistTrackDto> Tracks { get; set; } = new();
}
