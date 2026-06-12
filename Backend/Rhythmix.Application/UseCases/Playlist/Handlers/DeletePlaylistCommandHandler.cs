using MediatR;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class DeletePlaylistCommandHandler : IRequestHandler<DeletePlaylistCommand, bool>
{
    private readonly IPlaylistRepository _playlistRepository;

    public DeletePlaylistCommandHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<bool> Handle(DeletePlaylistCommand request, CancellationToken cancellationToken)
    {
        // Check if playlist exists and belongs to the user
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        if (playlist == null || playlist.OwnerId != request.UserId)
        {
            throw new InvalidOperationException("Playlist not found or you do not have permission to delete it.");
        }

        // Delete the playlist
        await _playlistRepository.DeleteAsync(request.PlaylistId);

        return true;
    }
}