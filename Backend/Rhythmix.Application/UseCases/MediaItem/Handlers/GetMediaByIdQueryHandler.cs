// Rhythmix.Application/UseCases/Media/Handlers/GetMediaByIdQueryHandler.cs
using MediatR;
using Rhythmix.Application.DTOs.Media;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Media.Handlers;

public sealed class GetMediaByIdQueryHandler : IRequestHandler<GetMediaByIdQuery, MediaDto?>
{
    private readonly IMediaRepository _mediaRepository;

    public GetMediaByIdQueryHandler(IMediaRepository mediaRepository)
    {
        _mediaRepository = mediaRepository;
    }

    public async Task<MediaDto?> Handle(GetMediaByIdQuery request, CancellationToken cancellationToken)
    {
        var media = await _mediaRepository.GetByIdAsync(request.MediaId);
        if (media == null) return null;

        return new MediaDto
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
            GenreId = media.GenreId,
            OwnerId = media.OwnerId,
            IsPublic = media.IsPublic,
            ViewCount = media.ViewCount,
            CreatedAt = media.CreatedAt
        };
    }
}