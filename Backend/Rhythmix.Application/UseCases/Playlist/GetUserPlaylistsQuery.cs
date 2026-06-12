using MediatR;
using Rhythmix.Application.DTOs.Playlist;

namespace Rhythmix.Application.UseCases.Playlist;

public sealed class GetUserPlaylistsQuery : IRequest<IEnumerable<PlaylistSummaryDto>>
{
    public Guid UserId { get; init; }
}