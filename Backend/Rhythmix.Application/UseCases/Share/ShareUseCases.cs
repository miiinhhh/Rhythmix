using MediatR;
using Rhythmix.Application.DTOs.Share;

namespace Rhythmix.Application.UseCases.Share;

public sealed class CreateShareCommand : IRequest<ShareItemDto>
{
    public Guid SenderId { get; init; }
    public Guid ReceiverId { get; init; }
    public Guid? MediaId { get; init; }
    public Guid? PlaylistId { get; init; }
    public string? Message { get; init; }
}

public sealed class GetSharedWithMeQuery : IRequest<IEnumerable<ShareItemDto>>
{
    public Guid UserId { get; init; }
}

public sealed class GetSharedByMeQuery : IRequest<IEnumerable<ShareItemDto>>
{
    public Guid UserId { get; init; }
}
