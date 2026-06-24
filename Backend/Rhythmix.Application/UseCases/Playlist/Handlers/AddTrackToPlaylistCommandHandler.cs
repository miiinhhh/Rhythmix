using MediatR;
using Rhythmix.Application.DTOs.Playlist;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class AddTrackToPlaylistCommandHandler : IRequestHandler<AddTrackToPlaylistCommand, PlaylistTrackDto>
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly IPlaylistTrackRepository _playlistTrackRepository;
    private readonly IMediaRepository _mediaRepository;

    public AddTrackToPlaylistCommandHandler(
        IPlaylistRepository playlistRepository,
        IPlaylistTrackRepository playlistTrackRepository,
        IMediaRepository mediaRepository)
    {
        _playlistRepository = playlistRepository;
        _playlistTrackRepository = playlistTrackRepository;
        _mediaRepository = mediaRepository;
    }

    public async Task<PlaylistTrackDto> Handle(AddTrackToPlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        if (playlist == null)
            throw new InvalidOperationException("Playlist not found");

        if (playlist.OwnerId != request.UserId)
            throw new UnauthorizedAccessException("Only playlist owner can add tracks");

        var media = await _mediaRepository.GetByIdAsync(request.MediaId);
        if (media == null)
            throw new InvalidOperationException("Media not found");

        var exists = await _playlistTrackRepository.ExistsAsync(request.PlaylistId, request.MediaId);
        if (exists)
            throw new InvalidOperationException("Track already exists in this playlist");

        var actualSortOrder = await _playlistTrackRepository.AddTrackAsync(
            request.PlaylistId, 
            request.MediaId, 
            -1 // ← Tự động tính SortOrder
        );

        return new PlaylistTrackDto
        {
            MediaId = request.MediaId,
            SortOrder = actualSortOrder,  
            Title = media.Title,
            FilePath = media.FilePath,
            ThumbnailUrl = media.ThumbnailUrl,
            Duration = media.Duration
        };
    }
}
