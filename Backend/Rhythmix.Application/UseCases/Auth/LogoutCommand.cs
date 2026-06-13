using MediatR;

namespace Rhythmix.Application.UseCases.Auth;

public sealed class LogoutCommand : IRequest<bool>
{
    public Guid UserId { get; set; }
}
