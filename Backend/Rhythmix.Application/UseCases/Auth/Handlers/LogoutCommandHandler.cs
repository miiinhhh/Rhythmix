using MediatR;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Auth.Handlers;

public sealed class LogoutCommandHandler : IRequestHandler<LogoutCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public LogoutCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (request.UserId == Guid.Empty)
        {
            return false;
        }

        var user = await _userRepository.GetByIdAsync(request.UserId);
        return user is not null;
    }
}
