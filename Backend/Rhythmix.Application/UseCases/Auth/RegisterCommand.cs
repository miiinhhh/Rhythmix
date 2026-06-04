using MediatR;
using Rhythmix.Application.DTOs.Auth;

namespace Rhythmix.Application.UseCases.Auth;

public sealed class RegisterCommand : IRequest<AuthResponse>
{
    public string Email { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string? DisplayName { get; init; }
    public string? Bio { get; init; }
    public string? AvatarUrl { get; init; }
}
