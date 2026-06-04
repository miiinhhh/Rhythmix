using MediatR;
using Rhythmix.Application.DTOs.Profile;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Profile.Handlers;

public sealed class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, ProfileDto?>
{
    private readonly IUserRepository _userRepository;

    public UpdateProfileCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ProfileDto?> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id);
        if (user is null)
        {
            return null;
        }

        user.UserName = request.UserName;
        user.DisplayName = request.DisplayName ?? user.DisplayName;
        user.Bio = request.Bio;
        user.AvatarUrl = request.AvatarUrl;

        await _userRepository.UpdateAsync(user);

        return new ProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            UserName = user.UserName,
            DisplayName = user.DisplayName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl
        };
    }
}
