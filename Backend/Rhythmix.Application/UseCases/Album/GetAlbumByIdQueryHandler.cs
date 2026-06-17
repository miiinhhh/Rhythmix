// Rhythmix.Application/UseCases/Album/Handlers/GetAlbumByIdQueryHandler.cs
using MediatR;
using Rhythmix.Application.DTOs.Media;
using Rhythmix.Application.DTOs.Album;
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

        var trackCount = await _albumRepository.GetTrackCountAsync(request.AlbumId);
        
        // Lấy tracks nếu cần
        // var tracks = await _mediaRepository.GetByAlbumIdAsync(request.AlbumId);

        return new AlbumDetailDto
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            Description = album.Description,
            CoverImageUrl = album.CoverImageUrl,
            ReleaseDate = album.ReleaseDate,
            CreatedAt = album.CreatedAt,
            OwnerId = album.OwnerId,
            TrackCount = trackCount,
            Tracks = new List<MediaDto>()
        };
    }
}

// Rhythmix.Application/UseCases/Album/Handlers/GetMyAlbumsQueryHandler.cs
public sealed class GetMyAlbumsQueryHandler : IRequestHandler<GetMyAlbumsQuery, IEnumerable<AlbumDto>>
{
    private readonly IAlbumRepository _albumRepository;

    public GetMyAlbumsQueryHandler(IAlbumRepository albumRepository)
    {
        _albumRepository = albumRepository;
    }

    public async Task<IEnumerable<AlbumDto>> Handle(GetMyAlbumsQuery request, CancellationToken cancellationToken)
    {
        var albums = await _albumRepository.GetByOwnerIdAsync(request.UserId);
        var result = new List<AlbumDto>();

        foreach (var album in albums)
        {
            var trackCount = await _albumRepository.GetTrackCountAsync(album.AlbumId);
            result.Add(new AlbumDto
            {
                AlbumId = album.AlbumId,
                Title = album.Title,
                Description = album.Description,
                CoverImageUrl = album.CoverImageUrl,
                ReleaseDate = album.ReleaseDate,
                CreatedAt = album.CreatedAt,
                OwnerId = album.OwnerId,
                TrackCount = trackCount
            });
        }

        return result;
    }
}