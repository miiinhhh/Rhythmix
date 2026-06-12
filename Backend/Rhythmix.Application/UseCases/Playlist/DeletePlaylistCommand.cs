using MediatR;

namespace Rhythmix.Application.UseCases.Playlist;

// Command để xóa playlist
public sealed class DeletePlaylistCommand : IRequest<bool>
{
    public Guid PlaylistId { get; init; }
    public Guid UserId { get; init; }
}