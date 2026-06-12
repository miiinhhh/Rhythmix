using MediatR;
using Rhythmix.Application.DTOs.Playlist;

namespace Rhythmix.Application.UseCases.Playlist;

public sealed class UpdatePlaylistInfoCommand : IRequest<PlaylistDto>
{
    public Guid PlaylistId { get; init; }
    public Guid UserId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}