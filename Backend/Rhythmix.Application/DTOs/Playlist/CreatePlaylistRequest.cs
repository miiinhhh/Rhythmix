using System.ComponentModel.DataAnnotations;

namespace Rhythmix.Application.DTOs.Playlist;

public sealed class CreatePlaylistRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public bool IsPublic { get; set; } = true;
}
