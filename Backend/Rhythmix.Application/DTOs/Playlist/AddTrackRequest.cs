using System.ComponentModel.DataAnnotations;

namespace Rhythmix.Application.DTOs.Playlist;

public sealed class AddTrackRequest
{
    [Required]
    public Guid PlaylistId { get; set; }

    [Required]
    public Guid MediaId { get; set; }

    public int SortOrder { get; set; } = 0;
}
