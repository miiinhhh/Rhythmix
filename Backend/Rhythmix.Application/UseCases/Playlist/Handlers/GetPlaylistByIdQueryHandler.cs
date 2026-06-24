// Rhythmix.Application/UseCases/Playlist/Handlers/GetPlaylistByIdQueryHandler.cs
using MediatR;
using Rhythmix.Application.DTOs.Playlist;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class GetPlaylistByIdQueryHandler : IRequestHandler<GetPlaylistByIdQuery, PlaylistDetailDto?>
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly IPlaylistTrackRepository _playlistTrackRepository;
    private readonly IMediaRepository _mediaRepository;  // ← Thêm

    public GetPlaylistByIdQueryHandler(
        IPlaylistRepository playlistRepository,
        IPlaylistTrackRepository playlistTrackRepository,
        IMediaRepository mediaRepository)  // ← Inject
    {
        _playlistRepository = playlistRepository;
        _playlistTrackRepository = playlistTrackRepository;
        _mediaRepository = mediaRepository;
    }

    public async Task<PlaylistDetailDto?> Handle(GetPlaylistByIdQuery request, CancellationToken cancellationToken)
    {
        // 1. Lấy playlist
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        if (playlist == null) return null;

        // 2. Lấy tracks (Domain Entity)
        var tracks = await _playlistTrackRepository.GetTracksAsync(request.PlaylistId);
        
        // 3. Lấy Media IDs
        var mediaIds = tracks.Select(t => t.MediaId).Distinct();
        
        // 4. ✅ Gọi IMediaRepository.GetByIdsAsync
        var mediaList = await _mediaRepository.GetByIdsAsync(mediaIds);
        var mediaDict = mediaList.ToDictionary(m => m.MediaId, m => m);

        // 5. Map sang DTO
        var trackDtos = tracks.Select(track => new PlaylistTrackDto
        {
            MediaId = track.MediaId,
            SortOrder = track.SortOrder,
            Title = mediaDict.ContainsKey(track.MediaId) ? mediaDict[track.MediaId].Title : string.Empty,
            ArtistName = mediaDict.ContainsKey(track.MediaId) ? mediaDict[track.MediaId].ArtistName : string.Empty,
            FilePath = mediaDict.ContainsKey(track.MediaId) ? mediaDict[track.MediaId].FilePath : string.Empty,
            ThumbnailUrl = mediaDict.ContainsKey(track.MediaId) ? mediaDict[track.MediaId].ThumbnailUrl : string.Empty,
            Duration = mediaDict.ContainsKey(track.MediaId) ? mediaDict[track.MediaId].Duration : 0
        }).ToList();

        // Lấy ảnh cover: dùng ảnh của playlist nếu có, nếu không dùng ảnh bài hát đầu tiên
        string? coverImageUrl = playlist.CoverImageUrl;
        if (string.IsNullOrEmpty(coverImageUrl) && tracks.Any())
        {
            var firstMediaId = tracks.First().MediaId;
            if (mediaDict.TryGetValue(firstMediaId, out var firstMedia))
            {
                coverImageUrl = firstMedia.ThumbnailUrl;
            }
        }

        return new PlaylistDetailDto
        {
            PlaylistId = playlist.Id,
            Name = playlist.Name,
            Description = playlist.Description,
            CoverImageUrl = coverImageUrl,
            IsPublic = playlist.IsPublic,
            OwnerId = playlist.OwnerId,
            CreatedAt = playlist.CreatedAt,
            Tracks = trackDtos
        };
    }
}
