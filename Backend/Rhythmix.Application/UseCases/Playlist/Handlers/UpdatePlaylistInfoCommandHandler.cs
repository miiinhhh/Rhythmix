using MediatR;
using Rhythmix.Application.DTOs.Playlist;
using Rhythmix.Application.UseCases.Playlist;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class UpdatePlaylistInfoCommandHandler : IRequestHandler<UpdatePlaylistInfoCommand, PlaylistDto?>
{
    private readonly IPlaylistRepository _playlistRepository;

    public UpdatePlaylistInfoCommandHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<PlaylistDto?> Handle(UpdatePlaylistInfoCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra playlist tồn tại
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        if (playlist == null)
            throw new InvalidOperationException("Playlist not found");

        // 2. Kiểm tra quyền
        if (playlist.OwnerId != request.UserId)
            throw new UnauthorizedAccessException("Only playlist owner can update playlist info");

        // 3. Validate
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Playlist name cannot be empty");

        // 4. Cập nhật thông tin
        var updated = await _playlistRepository.UpdateInfoAsync(
            request.PlaylistId, 
            request.Name.Trim(), 
            request.Description?.Trim());

        if (!updated)
            throw new InvalidOperationException("Failed to update playlist info");

        // 5. Cập nhật entity trong memory (không cần query lại DB)
        playlist.Name = request.Name.Trim();
        playlist.Description = request.Description?.Trim() ?? string.Empty;

        // 6. Trả về DTO từ entity đã cập nhật
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