using MediatR;
using Rhythmix.Application.DTOs.Playlist;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class GetUserPlaylistsQueryHandler : IRequestHandler<GetUserPlaylistsQuery, IEnumerable<PlaylistSummaryDto>>
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly IPlaylistTrackRepository _playlistTrackRepository;

    public GetUserPlaylistsQueryHandler(
        IPlaylistRepository playlistRepository,
        IPlaylistTrackRepository playlistTrackRepository)
    {
        _playlistRepository = playlistRepository;
        _playlistTrackRepository = playlistTrackRepository;
    }

    public async Task<IEnumerable<PlaylistSummaryDto>> Handle(
        GetUserPlaylistsQuery request, 
        CancellationToken cancellationToken)
    {
        // 1. Lấy danh sách playlist của user
        var playlists = await _playlistRepository.GetByOwnerIdAsync(request.UserId);
        
        if (!playlists.Any())
        {
            return Enumerable.Empty<PlaylistSummaryDto>();
        }

        // 2. Lấy số lượng track cho mỗi playlist
        var result = new List<PlaylistSummaryDto>();
        
        foreach (var playlist in playlists)
        {
            // Lấy số lượng track trong playlist
            var tracks = await _playlistTrackRepository.GetTracksAsync(playlist.Id);
            var trackCount = tracks.Count();
            
            // Lấy ảnh thumbnail từ bài hát đầu tiên (nếu có)
            var firstTrack = tracks.FirstOrDefault();
            string? thumbnailUrl = null;
            
            if (firstTrack != null)
            {
                // Có thể cần IMediaRepository để lấy thumbnail
                // Tạm thời để null hoặc lấy sau
            }
            
            result.Add(new PlaylistSummaryDto
            {
                PlaylistId = playlist.Id,
                Name = playlist.Name,
                Description = playlist.Description,
                IsPublic = playlist.IsPublic,
                TrackCount = trackCount,
                ThumbnailUrl = thumbnailUrl,
                CreatedAt = playlist.CreatedAt,
                UpdatedAt = null // Có thể thêm UpdatedAt vào Playlist entity sau
            });
        }
        
        return result;
    }
}