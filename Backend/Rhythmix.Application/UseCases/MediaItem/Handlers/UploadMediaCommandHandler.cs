
using MediatR;
using Rhythmix.Application.DTOs.Media;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Media;

public sealed class UploadMediaCommandHandler : IRequestHandler<UploadMediaCommand, MediaDto>
{
    private readonly IMediaRepository _mediaRepository;
    private readonly IFileStorageService _fileStorageService;

    public UploadMediaCommandHandler(
        IMediaRepository mediaRepository,
        IFileStorageService fileStorageService)
    {
        _mediaRepository = mediaRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<MediaDto> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate file
        if (!_fileStorageService.IsValidMediaFile(request.FileName, request.ContentType, out var mediaType))
        {
            throw new InvalidOperationException("Invalid file format. Only audio and video files are allowed.");
        }

        // 2. Save file to disk
        var filePath = await _fileStorageService.SaveFileAsync(request.FileStream, request.FileName, mediaType);

        // 3. Get duration (có thể dùng thư viện như TagLib hoặc NAudio)
        var duration = await GetDurationAsync(filePath, mediaType);

        // 4. Create media entity
        var media = new MediaItem
        {
            MediaId = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            MediaType = mediaType,
            Duration = duration,
            FilePath = filePath,
            MimeType = request.ContentType,
            FileSize = request.FileLength,
            AlbumId = request.AlbumId,
            GenreId = request.GenreId,
            OwnerId = request.OwnerId,
            IsPublic = request.IsPublic,
            ViewCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        // 5. Save to database
        await _mediaRepository.AddAsync(media);

        // 6. Return DTO
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
            OwnerId = media.OwnerId,
            IsPublic = media.IsPublic,
            ViewCount = media.ViewCount,
            CreatedAt = media.CreatedAt
        };
    }

    private async Task<int> GetDurationAsync(string filePath, string mediaType)
    {
        return await Task.FromResult(0);
    }
}