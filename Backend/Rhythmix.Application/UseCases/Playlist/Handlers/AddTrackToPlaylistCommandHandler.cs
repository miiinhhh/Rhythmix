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
        // 1. Kiểm tra playlist tồn tại
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        if (playlist == null)
            throw new InvalidOperationException("Playlist not found");

        // 2. Kiểm tra quyền (chỉ owner mới thêm được)
        if (playlist.OwnerId != request.UserId)
            throw new UnauthorizedAccessException("Only playlist owner can add tracks");

        // 3. Kiểm tra track đã tồn tại chưa
        var exists = await _playlistTrackRepository.ExistsAsync(request.PlaylistId, request.MediaId);
        if (exists)
            throw new InvalidOperationException("Track already exists in this playlist");

        // 4. Thêm track
        await _playlistTrackRepository.AddTrackAsync(request.PlaylistId, request.MediaId, request.SortOrder);

        // 5. ✅ Lấy thông tin Media
        var media = await _mediaRepository.GetByIdAsync(request.MediaId);
        if (media == null)
            throw new InvalidOperationException("Media not found");

        // 6. Trả về DTO
        return new PlaylistTrackDto
        {
            MediaId = request.MediaId,
            SortOrder = request.SortOrder,
            Title = media.Title,
            FilePath = media.FilePath,
            ThumbnailUrl = media.ThumbnailUrl,
            Duration = media.Duration
        };
    }
}