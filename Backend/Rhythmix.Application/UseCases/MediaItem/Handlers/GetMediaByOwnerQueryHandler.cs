// Rhythmix.Application/UseCases/Media/Handlers/GetMediaByOwnerQueryHandler.cs
using MediatR;
using Rhythmix.Application.DTOs.Media;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Media.Handlers;

public sealed class GetMediaByOwnerQueryHandler : IRequestHandler<GetMediaByOwnerQuery, IEnumerable<MediaDto>>
{
    private readonly IMediaRepository _mediaRepository;

    public GetMediaByOwnerQueryHandler(IMediaRepository mediaRepository)
    {
        _mediaRepository = mediaRepository;
    }

    public async Task<IEnumerable<MediaDto>> Handle(GetMediaByOwnerQuery request, CancellationToken cancellationToken)
    {
        var mediaList = await _mediaRepository.GetByOwnerIdAsync(request.OwnerId, request.Page, request.PageSize);

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
            AlbumId = media.AlbumId,
            OwnerId = media.OwnerId,
            IsPublic = media.IsPublic,
            ViewCount = media.ViewCount,
            CreatedAt = media.CreatedAt
        });
    }
}