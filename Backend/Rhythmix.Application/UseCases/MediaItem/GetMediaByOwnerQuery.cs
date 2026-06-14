
using MediatR;
using Rhythmix.Application.DTOs.Media;

namespace Rhythmix.Application.UseCases.Media;

public sealed class GetMediaByOwnerQuery : IRequest<IEnumerable<MediaDto>>
{
    public Guid OwnerId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}