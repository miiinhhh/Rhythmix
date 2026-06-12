using MediatR;
using Rhythmix.Application.DTOs.Playlist;

namespace Rhythmix.Application.UseCases.Playlist;

// Command để thêm track vào playlist
public sealed class AddTrackToPlaylistCommand : IRequest<PlaylistTrackDto>
{
    public Guid PlaylistId { get; init; }
    public Guid MediaId { get; init; }
    public Guid UserId { get; init; } 
    public int SortOrder { get; init; } = 0;
}
