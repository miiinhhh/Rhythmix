using MediatR;
using Rhythmix.Application.DTOs.Auth;

namespace Rhythmix.Application.UseCases.Auth;

public sealed class LoginQuery : IRequest<AuthResponse?>
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
