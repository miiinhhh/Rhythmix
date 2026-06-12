using MediatR;
using Rhythmix.Application.DTOs.Playlist;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class CreatePlaylistCommandHandler : IRequestHandler<CreatePlaylistCommand, PlaylistDto>
{
    private readonly IPlaylistRepository _playlistRepository;

    public CreatePlaylistCommandHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<PlaylistDto> Handle(CreatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = new Rhythmix.Domain.Entities.Playlist
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description ?? string.Empty,
            IsPublic = request.IsPublic,
            OwnerId = request.OwnerId,
            CreatedAt = DateTime.UtcNow
        };

        var id = await _playlistRepository.CreateAsync(playlist);

        return new PlaylistDto
        {
            PlaylistId = id,
            Name = playlist.Name,
            Description = playlist.Description,
            IsPublic = playlist.IsPublic,
            OwnerId = playlist.OwnerId,
            CreatedAt = playlist.CreatedAt
        };
    }
}
