using System.ComponentModel.DataAnnotations;

namespace Rhythmix.Application.DTOs.Share;

public sealed class CreateShareRequest
{
    [Required]
    public Guid ReceiverId { get; set; }

    public Guid? MediaId { get; set; }
    public Guid? PlaylistId { get; set; }

    [MaxLength(500)]
    public string? Message { get; set; }
}
