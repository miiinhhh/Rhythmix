using MediatR;
using Rhythmix.Application.DTOs.Media;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Media.Handlers;

public sealed class GetRecentMediaQueryHandler : IRequestHandler<GetRecentMediaQuery, IEnumerable<MediaDto>>
{
    private readonly IMediaRepository _mediaRepository;

    public GetRecentMediaQueryHandler(IMediaRepository mediaRepository)
    {
        _mediaRepository = mediaRepository;
    }

    public async Task<IEnumerable<MediaDto>> Handle(GetRecentMediaQuery request, CancellationToken cancellationToken)
    {
        var mediaList = await _mediaRepository.GetRecentAsync(request.Page, request.PageSize);

        return mediaList.Select(media => new MediaDto
        {
            MediaId = media.MediaId,
            Title = media.Title,
            Description = media.Description,
            MediaType = media.MediaType,
            Duration = media.Duration,
            FilePath = media.FilePath,
            ThumbnailUrl = media.ThumbnailUrl,
            MimeType = media.MimeType,
            FileSize = media.FileSize,
            VideoFilePath = media.VideoFilePath,
            VideoMimeType = media.VideoMimeType,
            VideoFileSize = media.VideoFileSize,
            ArtistId = media.ArtistId,
            ArtistName = media.ArtistName,
            AlbumId = media.AlbumId,
            AlbumTitle = media.AlbumTitle,
            GenreId = media.GenreId,
            OwnerId = media.OwnerId,
            IsPublic = media.IsPublic,
            ViewCount = media.ViewCount,
            CreatedAt = media.CreatedAt
        });
    }
}
