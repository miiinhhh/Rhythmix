// Rhythmix.Application/UseCases/Playlist/Handlers/UpdateTrackSortOrderCommandHandler.cs
using MediatR;
using Rhythmix.Application.DTOs.Playlist;
using Rhythmix.Application.UseCases.Playlist;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class UpdateTrackSortOrderCommandHandler : IRequestHandler<UpdateTrackSortOrderCommand, PlaylistTrackDto?>
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly IPlaylistTrackRepository _playlistTrackRepository;
    private readonly IMediaRepository _mediaRepository;

    public UpdateTrackSortOrderCommandHandler(
        IPlaylistRepository playlistRepository,
        IPlaylistTrackRepository playlistTrackRepository,
        IMediaRepository mediaRepository)
    {
        _playlistRepository = playlistRepository;
        _playlistTrackRepository = playlistTrackRepository;
        _mediaRepository = mediaRepository;
    }

    public async Task<PlaylistTrackDto?> Handle(UpdateTrackSortOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra playlist tồn tại và quyền sở hữu
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        if (playlist == null)
            throw new InvalidOperationException("Playlist not found");

        if (playlist.OwnerId != request.UserId)
            throw new UnauthorizedAccessException("Only playlist owner can reorder tracks");

        // 2. Kiểm tra track tồn tại trong playlist
        var exists = await _playlistTrackRepository.ExistsAsync(request.PlaylistId, request.MediaId);
        if (!exists)
            throw new InvalidOperationException("Track not found in playlist");

        // 3. Cập nhật sort order
        await _playlistTrackRepository.UpdateSortOrderAsync(
            request.PlaylistId, 
            request.MediaId, 
            request.NewSortOrder);

        // 4. Lấy thông tin chi tiết
        var trackDetail = await _playlistTrackRepository.GetTrackDetailAsync(request.PlaylistId, request.MediaId);
        var media = await _mediaRepository.GetByIdAsync(request.MediaId);

        // 5. Trả về DTO
        return new PlaylistTrackDto
        {
            MediaId = request.MediaId,
            SortOrder = request.NewSortOrder,
            Title = media?.Title ?? string.Empty,
            FilePath = media?.FilePath ?? string.Empty,
            ThumbnailUrl = media?.ThumbnailUrl ?? string.Empty,
            Duration = media?.Duration ?? 0
        };
    }
}