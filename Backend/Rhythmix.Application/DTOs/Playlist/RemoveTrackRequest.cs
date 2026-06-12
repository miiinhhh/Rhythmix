using System.ComponentModel.DataAnnotations;

namespace Rhythmix.Application.DTOs.Playlist;

public sealed class RemoveTrackRequest
{
    [Required]
    public Guid PlaylistId { get; set; }

    [Required]
    public Guid MediaId { get; set; }
}
