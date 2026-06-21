
using MediatR;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Media;

public sealed class StreamMediaQueryHandler : IRequestHandler<StreamMediaQuery, StreamMediaResponse?>
{
    private readonly IMediaRepository _mediaRepository;
    private readonly IFileStorageService _fileStorageService;

    public StreamMediaQueryHandler(
        IMediaRepository mediaRepository,
        IFileStorageService fileStorageService)
    {
        _mediaRepository = mediaRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<StreamMediaResponse?> Handle(StreamMediaQuery request, CancellationToken cancellationToken)
    {
        // 1. Get media from database
        var media = await _mediaRepository.GetByIdAsync(request.MediaId);
        if (media == null || !media.IsPublic)
        {
            return null;
        }

        // 2. Increment view count
        await _mediaRepository.IncrementViewCountAsync(request.MediaId);

        // 3. Chọn file audio hoặc video tuỳ tham số 'type'
        var wantsVideo = string.Equals(request.Type, "video", StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrEmpty(media.VideoFilePath);

        var targetPath = wantsVideo ? media.VideoFilePath! : media.FilePath;
        var targetMimeType = wantsVideo
            ? (media.VideoMimeType ?? _fileStorageService.GetContentType(targetPath))
            : _fileStorageService.GetContentType(media.FilePath);
        var targetSize = wantsVideo ? (media.VideoFileSize ?? 0) : media.FileSize;

        var fileStream = await _fileStorageService.GetFileStreamAsync(targetPath);
        if (fileStream == null)
        {
            return null;
        }

        var response = new StreamMediaResponse
        {
            FileStream = fileStream,
            ContentType = targetMimeType,
            FileSize = targetSize,
            IsPartialContent = false,
            StartPosition = 0,
            EndPosition = targetSize - 1
        };

        // 5. Handle Range header for video streaming
        if (!string.IsNullOrEmpty(request.Range))
        {
            var range = ParseRange(request.Range, media.FileSize);
            if (range.HasValue)
            {
                response.IsPartialContent = true;
                response.StartPosition = range.Value.start;
                response.EndPosition = range.Value.end;
                response.FileStream.Seek(response.StartPosition, SeekOrigin.Begin);
            }
        }

        return response;
    }

    private (long start, long end)? ParseRange(string rangeHeader, long fileSize)
    {
        if (!rangeHeader.StartsWith("bytes="))
            return null;

        var range = rangeHeader.Replace("bytes=", "").Split('-');
        if (range.Length != 2)
            return null;

        if (!long.TryParse(range[0], out var start))
            return null;

        var end = fileSize - 1;
        if (!string.IsNullOrEmpty(range[1]) && long.TryParse(range[1], out var parsedEnd))
        {
            end = Math.Min(parsedEnd, fileSize - 1);
        }

        if (start > end || start >= fileSize)
            return null;

        return (start, end);
    }
}