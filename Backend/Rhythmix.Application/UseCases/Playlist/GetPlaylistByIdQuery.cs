using MediatR;
using Rhythmix.Application.DTOs.Playlist;

namespace Rhythmix.Application.UseCases.Playlist;

// Query để lấy chi tiết playlist theo ID
public sealed class GetPlaylistByIdQuery : IRequest<PlaylistDetailDto?>
{
    public Guid PlaylistId { get; init; }
}
