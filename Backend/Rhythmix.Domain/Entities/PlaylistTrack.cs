namespace Rhythmix.Domain.Entities;

public class PlaylistTrack
{
    public Guid PlaylistId { get; set; }
    public Guid MediaId { get; set; }
    public int SortOrder { get; set; }
}