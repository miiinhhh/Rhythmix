using MediatR;
using Rhythmix.Application.DTOs.Playlist;

namespace Rhythmix.Application.UseCases.Playlist;

// Command để tạo playlist mới
public sealed class CreatePlaylistCommand : IRequest<PlaylistDto>
{
    public Guid OwnerId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsPublic { get; init; } = true;
}
