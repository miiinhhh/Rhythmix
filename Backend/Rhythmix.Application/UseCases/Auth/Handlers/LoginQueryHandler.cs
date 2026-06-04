using MediatR;
using Rhythmix.Application.DTOs.Auth;
using Rhythmix.Application.Helpers;
using Rhythmix.Application.Interfaces;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Auth.Handlers;

public sealed class LoginQueryHandler : IRequestHandler<LoginQuery, AuthResponse?>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _tokenGenerator;

    public LoginQueryHandler(IUserRepository userRepository, IJwtTokenGenerator tokenGenerator)
    {
        _userRepository = userRepository;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<AuthResponse?> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user is null)
        {
            return null;
        }

        if (!PasswordHasher.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        var token = _tokenGenerator.GenerateToken(user);
        return new AuthResponse
        {
            Id = user.Id,
            Email = user.Email,
            UserName = user.UserName,
            DisplayName = user.DisplayName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            Token = token
        };
    }
}
