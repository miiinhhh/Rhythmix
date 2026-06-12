using MediatR;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class RemoveTrackFromPlaylistCommandHandler : IRequestHandler<RemoveTrackFromPlaylistCommand, bool>
{
    private readonly IPlaylistTrackRepository _playlistTrackRepository;

    public RemoveTrackFromPlaylistCommandHandler(IPlaylistTrackRepository playlistTrackRepository)
    {
        _playlistTrackRepository = playlistTrackRepository;
    }

    public async Task<bool> Handle(RemoveTrackFromPlaylistCommand request, CancellationToken cancellationToken)
    {
        // Check if track exists in playlist
        if (!await _playlistTrackRepository.ExistsAsync(request.PlaylistId, request.MediaId))
        {
            throw new InvalidOperationException("Track does not exist in this playlist.");
        }

        // Remove track from playlist
        await _playlistTrackRepository.RemoveTrackAsync(request.PlaylistId, request.MediaId);

        return true;
    }
}
