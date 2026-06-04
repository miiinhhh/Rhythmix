using System.ComponentModel.DataAnnotations;

namespace Rhythmix.Application.DTOs.Profile;

public sealed class UpdateProfileRequest
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    [MinLength(4)]
    public string UserName { get; set; } = string.Empty;

    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}
