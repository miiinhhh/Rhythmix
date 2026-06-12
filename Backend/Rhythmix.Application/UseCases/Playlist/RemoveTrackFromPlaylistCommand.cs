using MediatR;

namespace Rhythmix.Application.UseCases.Playlist;

// Command để xóa track khỏi playlist
public sealed class RemoveTrackFromPlaylistCommand : IRequest<bool>
{
    public Guid PlaylistId { get; init; }
    public Guid MediaId { get; init; }
    public Guid UserId { get; init; }
}
