using System.ComponentModel.DataAnnotations;

namespace Rhythmix.Application.DTOs.Playlist;

public sealed class UpdateVisibilityRequest
{
    [Required]
    public Guid PlaylistId { get; set; }

    [Required]
    public bool IsPublic { get; set; }
}
