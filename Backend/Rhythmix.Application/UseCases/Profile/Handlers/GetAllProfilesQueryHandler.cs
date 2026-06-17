using MediatR;
using Rhythmix.Application.DTOs.Profile;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Profile.Handlers;

public sealed class GetAllProfilesQueryHandler : IRequestHandler<GetAllProfilesQuery, IEnumerable<ProfileDto>>
{
    private readonly IUserRepository _userRepository;

    public GetAllProfilesQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<ProfileDto>> Handle(GetAllProfilesQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync();

        return users.Select(user => new ProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            UserName = user.UserName,
            DisplayName = user.DisplayName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl
        });
    }
}
