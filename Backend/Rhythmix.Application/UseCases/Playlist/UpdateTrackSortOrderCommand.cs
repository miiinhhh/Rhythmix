using MediatR;
using Rhythmix.Application.DTOs.Playlist;

namespace Rhythmix.Application.UseCases.Playlist;

public sealed class UpdateTrackSortOrderCommand : IRequest<PlaylistTrackDto>
{
    public Guid PlaylistId { get; init; }
    public Guid MediaId { get; init; }
    public Guid UserId { get; init; }
    public int NewSortOrder { get; init; }
}