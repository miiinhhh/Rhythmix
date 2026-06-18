using System.Buffers.Binary;
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
        if (!_fileStorageService.IsValidMediaFile(request.FileName, request.ContentType, out var mediaType))
        {
            throw new InvalidOperationException("Invalid file format. Only audio and video files are allowed.");
        }

        var filePath = await _fileStorageService.SaveFileAsync(request.FileStream, request.FileName, mediaType);
        var thumbnailUrl = await SaveCoverImageAsync(request);
        var duration = await GetDurationAsync(filePath);

        var media = new MediaItem
        {
            MediaId = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            MediaType = mediaType,
            Duration = duration,
            FilePath = filePath,
            ThumbnailUrl = thumbnailUrl,
            MimeType = request.ContentType,
            FileSize = request.FileLength,
            AlbumId = request.AlbumId,
            GenreId = request.GenreId,
            OwnerId = request.OwnerId,
            IsPublic = request.IsPublic,
            ViewCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _mediaRepository.AddAsync(media);

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

    private async Task<string> SaveCoverImageAsync(UploadMediaCommand request)
    {
        if (request.CoverImageStream == null || string.IsNullOrWhiteSpace(request.CoverImageFileName))
        {
            return string.Empty;
        }

        return await _fileStorageService.SaveFileAsync(
            request.CoverImageStream,
            request.CoverImageFileName,
            "images");
    }

    private static async Task<int> GetDurationAsync(string filePath)
    {
        var fullPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

        if (!File.Exists(fullPath))
        {
            return 0;
        }

        return Path.GetExtension(fullPath).ToLowerInvariant() switch
        {
            ".wav" => await GetWavDurationAsync(fullPath),
            ".mp3" => await GetMp3DurationAsync(fullPath),
            ".m4a" or ".mp4" => await GetMp4DurationAsync(fullPath),
            _ => 0
        };
    }

    private static async Task<int> GetWavDurationAsync(string fullPath)
    {
        await using var stream = File.OpenRead(fullPath);
        if (stream.Length < 44)
        {
            return 0;
        }

        var header = new byte[44];
        var read = await stream.ReadAsync(header);
        if (read < header.Length ||
            header[0] != 'R' || header[1] != 'I' || header[2] != 'F' || header[3] != 'F' ||
            header[8] != 'W' || header[9] != 'A' || header[10] != 'V' || header[11] != 'E')
        {
            return 0;
        }

        var byteRate = BinaryPrimitives.ReadInt32LittleEndian(header.AsSpan(28, 4));
        var dataSize = BinaryPrimitives.ReadInt32LittleEndian(header.AsSpan(40, 4));
        return byteRate <= 0 ? 0 : Math.Max(0, (int)Math.Round(dataSize / (double)byteRate));
    }

    private static async Task<int> GetMp3DurationAsync(string fullPath)
    {
        await using var stream = File.OpenRead(fullPath);
        var fileSize = stream.Length;
        var startOffset = await SkipId3v2TagAsync(stream);
        stream.Position = startOffset;

        var header = new byte[4];
        while (stream.Position <= stream.Length - header.Length)
        {
            var read = await stream.ReadAsync(header);
            if (read < header.Length)
            {
                return 0;
            }

            if (TryGetMp3BitrateKbps(header, out var bitrateKbps))
            {
                var audioBytes = Math.Max(0, fileSize - startOffset);
                return bitrateKbps <= 0 ? 0 : Math.Max(0, (int)Math.Round(audioBytes * 8d / (bitrateKbps * 1000d)));
            }

            stream.Position -= 3;
        }

        return 0;
    }

    private static async Task<long> SkipId3v2TagAsync(Stream stream)
    {
        if (stream.Length < 10)
        {
            return 0;
        }

        var header = new byte[10];
        var read = await stream.ReadAsync(header);
        if (read < header.Length || header[0] != 'I' || header[1] != 'D' || header[2] != '3')
        {
            return 0;
        }

        var tagSize =
            ((header[6] & 0x7F) << 21) |
            ((header[7] & 0x7F) << 14) |
            ((header[8] & 0x7F) << 7) |
            (header[9] & 0x7F);

        return 10L + tagSize;
    }

    private static bool TryGetMp3BitrateKbps(byte[] header, out int bitrateKbps)
    {
        bitrateKbps = 0;
        if (header[0] != 0xFF || (header[1] & 0xE0) != 0xE0)
        {
            return false;
        }

        var versionBits = (header[1] >> 3) & 0x03;
        var layerBits = (header[1] >> 1) & 0x03;
        var bitrateIndex = (header[2] >> 4) & 0x0F;

        if (versionBits == 1 || layerBits == 0 || bitrateIndex is 0 or 15)
        {
            return false;
        }

        var isMpeg1 = versionBits == 3;
        var layer = 4 - layerBits;

        var mpeg1Layer1 = new[] { 0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 0 };
        var mpeg1Layer2 = new[] { 0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 0 };
        var mpeg1Layer3 = new[] { 0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0 };
        var mpeg2Layer1 = new[] { 0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0 };
        var mpeg2Layer23 = new[] { 0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0 };

        bitrateKbps = (isMpeg1, layer) switch
        {
            (true, 1) => mpeg1Layer1[bitrateIndex],
            (true, 2) => mpeg1Layer2[bitrateIndex],
            (true, 3) => mpeg1Layer3[bitrateIndex],
            (false, 1) => mpeg2Layer1[bitrateIndex],
            _ => mpeg2Layer23[bitrateIndex]
        };

        return bitrateKbps > 0;
    }

    private static async Task<int> GetMp4DurationAsync(string fullPath)
    {
        await using var stream = File.OpenRead(fullPath);
        return await FindMvhdDurationAsync(stream, stream.Length);
    }

    private static async Task<int> FindMvhdDurationAsync(Stream stream, long endPosition)
    {
        var header = new byte[8];
        while (stream.Position + 8 <= endPosition)
        {
            var atomStart = stream.Position;
            var read = await stream.ReadAsync(header);
            if (read < 8)
            {
                return 0;
            }

            var atomSize = BinaryPrimitives.ReadUInt32BigEndian(header.AsSpan(0, 4));
            var atomType = System.Text.Encoding.ASCII.GetString(header, 4, 4);
            var payloadStart = stream.Position;
            long atomEnd;

            if (atomSize == 1)
            {
                var largeSizeBytes = new byte[8];
                if (await stream.ReadAsync(largeSizeBytes) < 8)
                {
                    return 0;
                }

                atomEnd = atomStart + (long)BinaryPrimitives.ReadUInt64BigEndian(largeSizeBytes);
                payloadStart = stream.Position;
            }
            else if (atomSize == 0)
            {
                atomEnd = endPosition;
            }
            else
            {
                atomEnd = atomStart + atomSize;
            }

            if (atomEnd <= payloadStart || atomEnd > endPosition)
            {
                return 0;
            }

            if (atomType == "mvhd")
            {
                return await ReadMvhdDurationAsync(stream);
            }

            if (atomType is "moov" or "trak" or "mdia")
            {
                var duration = await FindMvhdDurationAsync(stream, atomEnd);
                if (duration > 0)
                {
                    return duration;
                }
            }

            stream.Position = atomEnd;
        }

        return 0;
    }

    private static async Task<int> ReadMvhdDurationAsync(Stream stream)
    {
        var versionBytes = new byte[1];
        if (await stream.ReadAsync(versionBytes) < 1)
        {
            return 0;
        }

        stream.Position += 3;
        var version = versionBytes[0];

        if (version == 1)
        {
            stream.Position += 16;
            var data = new byte[12];
            if (await stream.ReadAsync(data) < data.Length)
            {
                return 0;
            }

            var timescale = BinaryPrimitives.ReadUInt32BigEndian(data.AsSpan(0, 4));
            var duration = BinaryPrimitives.ReadUInt64BigEndian(data.AsSpan(4, 8));
            return timescale == 0 ? 0 : Math.Max(0, (int)Math.Round(duration / (double)timescale));
        }

        stream.Position += 8;
        var dataV0 = new byte[8];
        if (await stream.ReadAsync(dataV0) < dataV0.Length)
        {
            return 0;
        }

        var timescaleV0 = BinaryPrimitives.ReadUInt32BigEndian(dataV0.AsSpan(0, 4));
        var durationV0 = BinaryPrimitives.ReadUInt32BigEndian(dataV0.AsSpan(4, 4));
        return timescaleV0 == 0 ? 0 : Math.Max(0, (int)Math.Round(durationV0 / (double)timescaleV0));
    }
}
