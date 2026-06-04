using MediatR;
using Rhythmix.Application.DTOs.Profile;

namespace Rhythmix.Application.UseCases.Profile;

public sealed class UpdateProfileCommand : IRequest<ProfileDto?>
{
    public Guid Id { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string? DisplayName { get; init; }
    public string? Bio { get; init; }
    public string? AvatarUrl { get; init; }
}
