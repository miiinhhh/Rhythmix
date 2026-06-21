using MediatR;
using Rhythmix.Application.DTOs.Album;
using Rhythmix.Application.DTOs.Media;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Album;

public sealed class GetAlbumByIdQueryHandler : IRequestHandler<GetAlbumByIdQuery, AlbumDetailDto?>
{
    private readonly IAlbumRepository _albumRepository;
    private readonly IMediaRepository _mediaRepository;

    public GetAlbumByIdQueryHandler(
        IAlbumRepository albumRepository,
        IMediaRepository mediaRepository)
    {
        _albumRepository = albumRepository;
        _mediaRepository = mediaRepository;
    }

    public async Task<AlbumDetailDto?> Handle(GetAlbumByIdQuery request, CancellationToken cancellationToken)
    {
        var album = await _albumRepository.GetByIdAsync(request.AlbumId);
        if (album == null) return null;

        var tracks = (await _mediaRepository.GetByAlbumIdAsync(request.AlbumId)).ToList();

        return new AlbumDetailDto
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            Description = album.Description,
            CoverImageUrl = album.CoverImageUrl ?? tracks.FirstOrDefault(media => !string.IsNullOrWhiteSpace(media.ThumbnailUrl))?.ThumbnailUrl,
            ReleaseDate = album.ReleaseDate,
            CreatedAt = album.CreatedAt,
            OwnerId = album.OwnerId,
            TrackCount = tracks.Count,
            Tracks = tracks.Select(ToMediaDto).ToList()
        };
    }

    private static MediaDto ToMediaDto(Rhythmix.Domain.Entities.MediaItem media) => new()
    {
        MediaId = media.MediaId,
        Title = media.Title,
        Description = media.Description,
        MediaType = media.MediaType,
        Duration = media.Duration,
        FilePath = media.FilePath,
        ThumbnailUrl = media.ThumbnailUrl,
        MimeType = media.MimeType,
        VideoFilePath = media.VideoFilePath,
        VideoMimeType = media.VideoMimeType,
        VideoFileSize = media.VideoFileSize,
        ArtistId = media.ArtistId,
        ArtistName = media.ArtistName,
        AlbumId = media.AlbumId,
        GenreId = media.GenreId,
        OwnerId = media.OwnerId,
        IsPublic = media.IsPublic,
        ViewCount = media.ViewCount,
        CreatedAt = media.CreatedAt
    };
}

public sealed class GetMyAlbumsQueryHandler : IRequestHandler<GetMyAlbumsQuery, IEnumerable<AlbumDto>>
{
    private readonly IAlbumRepository _albumRepository;
    private readonly IMediaRepository _mediaRepository;

    public GetMyAlbumsQueryHandler(IAlbumRepository albumRepository, IMediaRepository mediaRepository)
    {
        _albumRepository = albumRepository;
        _mediaRepository = mediaRepository;
    }

    public async Task<IEnumerable<AlbumDto>> Handle(GetMyAlbumsQuery request, CancellationToken cancellationToken)
    {
        var albums = await _albumRepository.GetByOwnerIdAsync(request.UserId);
        var result = new List<AlbumDto>();

        foreach (var album in albums)
        {
            var tracks = (await _mediaRepository.GetByAlbumIdAsync(album.AlbumId)).ToList();
            result.Add(new AlbumDto
            {
                AlbumId = album.AlbumId,
                Title = album.Title,
                Description = album.Description,
                CoverImageUrl = album.CoverImageUrl ?? tracks.FirstOrDefault(media => !string.IsNullOrWhiteSpace(media.ThumbnailUrl))?.ThumbnailUrl,
                ReleaseDate = album.ReleaseDate,
                CreatedAt = album.CreatedAt,
                OwnerId = album.OwnerId,
                TrackCount = tracks.Count
            });
        }

        return result;
    }
}
