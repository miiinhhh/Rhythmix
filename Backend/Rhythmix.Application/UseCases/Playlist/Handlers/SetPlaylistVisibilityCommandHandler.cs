using MediatR;
using Rhythmix.Application.DTOs.Playlist;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class SetPlaylistVisibilityCommandHandler : IRequestHandler<SetPlaylistVisibilityCommand, PlaylistDto>
{
    private readonly IPlaylistRepository _playlistRepository;

    public SetPlaylistVisibilityCommandHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<PlaylistDto> Handle(SetPlaylistVisibilityCommand request, CancellationToken cancellationToken)
    {
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        
        if (playlist == null)
        {
            throw new InvalidOperationException("Playlist not found.");
        }

        // Update visibility
        playlist.IsPublic = request.IsPublic;
        await _playlistRepository.UpdateAsync(playlist);

        return new PlaylistDto
        {
            PlaylistId = playlist.Id,
            Name = playlist.Name,
            Description = playlist.Description,
            IsPublic = playlist.IsPublic,
            OwnerId = playlist.OwnerId,
            CreatedAt = playlist.CreatedAt
        };
    }
}
