using MediatR;
using Rhythmix.Application.DTOs.Profile;

namespace Rhythmix.Application.UseCases.Profile;

public sealed class GetAllProfilesQuery : IRequest<IEnumerable<ProfileDto>>
{
}
