namespace Rhythmix.Application.DTOs.Playlist;

public class UpdateTrackSortOrderRequest
{
    public Guid MediaId { get; set; }
    public int NewSortOrder { get; set; }
}