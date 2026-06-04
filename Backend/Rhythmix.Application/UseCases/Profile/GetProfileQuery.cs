using MediatR;
using Rhythmix.Application.DTOs.Profile;

namespace Rhythmix.Application.UseCases.Profile;

public sealed class GetProfileQuery : IRequest<ProfileDto?>
{
    public Guid UserId { get; init; }
}
