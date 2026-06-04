using MediatR;
using Rhythmix.Application.DTOs.Auth;
using Rhythmix.Application.Helpers;
using Rhythmix.Application.Interfaces;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Auth.Handlers;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _tokenGenerator;

    public RegisterCommandHandler(IUserRepository userRepository, IJwtTokenGenerator tokenGenerator)
    {
        _userRepository = userRepository;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _userRepository.ExistsByEmailAsync(request.Email))
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        var hash = PasswordHasher.Hash(request.Password);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            UserName = request.UserName,
            DisplayName = request.DisplayName ?? request.UserName,
            Bio = request.Bio,
            AvatarUrl = request.AvatarUrl,
            PasswordHash = hash,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);
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
