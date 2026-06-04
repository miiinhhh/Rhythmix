using MediatR;
using Rhythmix.Application.DTOs.Profile;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Profile.Handlers;

public sealed class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, ProfileDto?>
{
    private readonly IUserRepository _userRepository;

    public GetProfileQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ProfileDto?> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user is null)
        {
            return null;
        }

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
