using System.Buffers.Binary;
using MediatR;
using Rhythmix.Application.DTOs.Media;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Media;

public sealed class UploadMediaCommandHandler : IRequestHandler<UploadMediaCommand, MediaDto>
{
    private readonly IMediaRepository _mediaRepository;
    private readonly IArtistRepository _artistRepository;
    private readonly IAlbumRepository _albumRepository;
    private readonly IFileStorageService _fileStorageService;

    public UploadMediaCommandHandler(
        IMediaRepository mediaRepository,
        IArtistRepository artistRepository,
        IAlbumRepository albumRepository,
        IFileStorageService fileStorageService)
    {
        _mediaRepository = mediaRepository;
        _artistRepository = artistRepository;
        _albumRepository = albumRepository;
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
        var (videoFilePath, videoMimeType, videoFileSize) = await SaveVideoFileAsync(request);
        var duration = await GetDurationAsync(filePath);
        var artist = await GetOrCreateArtistAsync(request.ArtistName);

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
            ArtistId = artist?.ArtistId,
            ArtistName = artist?.Name ?? string.Empty,
            AlbumId = request.AlbumId,
            GenreId = request.GenreId,
            OwnerId = request.OwnerId,
            IsPublic = request.IsPublic,
            ViewCount = 0,
            CreatedAt = DateTime.UtcNow,
            VideoFilePath = videoFilePath,
            VideoMimeType = videoMimeType,
            VideoFileSize = videoFileSize,
        };

        await _mediaRepository.AddAsync(media);
        await _mediaRepository.SetGenresAsync(media.MediaId, request.GenreIds);

        string? albumTitle = null;
        if (request.AlbumId.HasValue)
        {
            var album = await _albumRepository.GetByIdAsync(request.AlbumId.Value);
            albumTitle = album?.Title;
        }

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
            ArtistId = media.ArtistId,
            ArtistName = media.ArtistName,
            AlbumId = media.AlbumId,
            AlbumTitle = albumTitle,
            GenreId = media.GenreId,
            OwnerId = media.OwnerId,
            IsPublic = media.IsPublic,
            ViewCount = media.ViewCount,
            CreatedAt = media.CreatedAt,
            VideoFilePath = videoFilePath,
            VideoMimeType = videoMimeType,
            VideoFileSize = videoFileSize,
        };
    }

    private async Task<Artist?> GetOrCreateArtistAsync(string? artistName)
    {
        if (string.IsNullOrWhiteSpace(artistName))
        {
            return null;
        }

        var name = artistName.Trim();
        var existing = await _artistRepository.GetByNameAsync(name);
        if (existing != null)
        {
            return existing;
        }

        var artist = new Artist
        {
            ArtistId = Guid.NewGuid(),
            Name = name,
            CreatedAt = DateTime.UtcNow
        };

        await _artistRepository.AddAsync(artist);
        return artist;
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
    
    private async Task<(string? path, string? mimeType, long? size)> SaveVideoFileAsync(UploadMediaCommand request)
    {
        if (request.VideoFileStream == null || string.IsNullOrWhiteSpace(request.VideoFileName))
        {
            return (null, null, null);
        }

        var path = await _fileStorageService.SaveFileAsync(request.VideoFileStream, request.VideoFileName, "video");
        var mimeType = request.VideoContentType ?? _fileStorageService.GetContentType(request.VideoFileName);
        return (path, mimeType, request.VideoFileLength);
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
        var startOffset = await SkipId3v2TagAsync(stream);
        stream.Position = startOffset;

        var header = new byte[4];
        long firstFrameStart = -1;
        Mp3FrameInfo? firstFrame = null;
        long totalSamples = 0;

        while (stream.Position <= stream.Length - header.Length)
        {
            var frameStart = stream.Position;
            var read = await stream.ReadAsync(header);
            if (read < header.Length)
            {
                break;
            }

            if (!TryReadMp3Frame(header, out var frame))
            {
                stream.Position = frameStart + 1;
                continue;
            }

            firstFrameStart = firstFrameStart < 0 ? frameStart : firstFrameStart;
            firstFrame ??= frame;
            totalSamples += frame.SamplesPerFrame;

            var nextFrame = frameStart + frame.FrameLength;
            if (nextFrame <= frameStart || nextFrame > stream.Length)
            {
                break;
            }

            stream.Position = nextFrame;
        }

        if (firstFrameStart < 0 || firstFrame is null || totalSamples <= 0)
        {
            return 0;
        }

        var vbrDuration = await TryGetMp3VbrDurationAsync(stream, firstFrameStart, firstFrame.Value);
        if (vbrDuration > 0)
        {
            return vbrDuration;
        }

        return Math.Max(0, (int)Math.Round(totalSamples / (double)firstFrame.Value.SampleRate));
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

    private readonly record struct Mp3FrameInfo(
        int VersionBits,
        int Layer,
        int BitrateKbps,
        int SampleRate,
        int SamplesPerFrame,
        int FrameLength,
        int Channels);

    private static bool TryReadMp3Frame(byte[] header, out Mp3FrameInfo frame)
    {
        frame = default;
        if (header[0] != 0xFF || (header[1] & 0xE0) != 0xE0)
        {
            return false;
        }

        var versionBits = (header[1] >> 3) & 0x03;
        var layerBits = (header[1] >> 1) & 0x03;
        var bitrateIndex = (header[2] >> 4) & 0x0F;
        var sampleRateIndex = (header[2] >> 2) & 0x03;
        var padding = (header[2] >> 1) & 0x01;

        if (versionBits == 1 || layerBits == 0 || bitrateIndex is 0 or 15 || sampleRateIndex == 3)
        {
            return false;
        }

        var isMpeg1 = versionBits == 3;
        var layer = 4 - layerBits;

        int[] mpeg1Layer1 = [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 0];
        int[] mpeg1Layer2 = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 0];
        int[] mpeg1Layer3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
        int[] mpeg2Layer1 = [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0];
        int[] mpeg2Layer23 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];

        var bitrateKbps = (isMpeg1, layer) switch
        {
            (true, 1) => mpeg1Layer1[bitrateIndex],
            (true, 2) => mpeg1Layer2[bitrateIndex],
            (true, 3) => mpeg1Layer3[bitrateIndex],
            (false, 1) => mpeg2Layer1[bitrateIndex],
            _ => mpeg2Layer23[bitrateIndex]
        };

        if (bitrateKbps <= 0)
        {
            return false;
        }

        var sampleRates = versionBits switch
        {
            3 => new[] { 44100, 48000, 32000 },
            2 => new[] { 22050, 24000, 16000 },
            _ => new[] { 11025, 12000, 8000 }
        };
        var sampleRate = sampleRates[sampleRateIndex];
        var samplesPerFrame = layer switch
        {
            1 => 384,
            2 => 1152,
            _ => isMpeg1 ? 1152 : 576
        };
        var frameLength = layer switch
        {
            1 => ((12 * bitrateKbps * 1000 / sampleRate) + padding) * 4,
            3 when !isMpeg1 => 72 * bitrateKbps * 1000 / sampleRate + padding,
            _ => 144 * bitrateKbps * 1000 / sampleRate + padding
        };
        var channelMode = (header[3] >> 6) & 0x03;
        var channels = channelMode == 3 ? 1 : 2;

        if (frameLength <= 4)
        {
            return false;
        }

        frame = new Mp3FrameInfo(
            versionBits,
            layer,
            bitrateKbps,
            sampleRate,
            samplesPerFrame,
            frameLength,
            channels);

        return true;
    }

    private static async Task<int> TryGetMp3VbrDurationAsync(Stream stream, long frameStart, Mp3FrameInfo frame)
    {
        if (frame.Layer != 3)
        {
            return 0;
        }

        var xingOffset = frame.VersionBits == 3
            ? frame.Channels == 1 ? 21 : 36
            : frame.Channels == 1 ? 13 : 21;

        var xingDuration = await TryReadXingDurationAsync(stream, frameStart + xingOffset, frame);
        if (xingDuration > 0)
        {
            return xingDuration;
        }

        return await TryReadVbriDurationAsync(stream, frameStart + 36, frame);
    }

    private static async Task<int> TryReadXingDurationAsync(Stream stream, long offset, Mp3FrameInfo frame)
    {
        if (offset < 0 || offset + 12 > stream.Length)
        {
            return 0;
        }

        stream.Position = offset;
        var data = new byte[12];
        if (await stream.ReadAsync(data) < data.Length)
        {
            return 0;
        }

        var marker = System.Text.Encoding.ASCII.GetString(data, 0, 4);
        if (marker is not ("Xing" or "Info"))
        {
            return 0;
        }

        var flags = BinaryPrimitives.ReadUInt32BigEndian(data.AsSpan(4, 4));
        if ((flags & 0x01) == 0)
        {
            return 0;
        }

        var frameCount = BinaryPrimitives.ReadUInt32BigEndian(data.AsSpan(8, 4));
        return frameCount == 0
            ? 0
            : Math.Max(0, (int)Math.Round(frameCount * frame.SamplesPerFrame / (double)frame.SampleRate));
    }

    private static async Task<int> TryReadVbriDurationAsync(Stream stream, long offset, Mp3FrameInfo frame)
    {
        if (offset < 0 || offset + 18 > stream.Length)
        {
            return 0;
        }

        stream.Position = offset;
        var data = new byte[18];
        if (await stream.ReadAsync(data) < data.Length)
        {
            return 0;
        }

        var marker = System.Text.Encoding.ASCII.GetString(data, 0, 4);
        if (marker != "VBRI")
        {
            return 0;
        }

        var frameCount = BinaryPrimitives.ReadUInt32BigEndian(data.AsSpan(14, 4));
        return frameCount == 0
            ? 0
            : Math.Max(0, (int)Math.Round(frameCount * frame.SamplesPerFrame / (double)frame.SampleRate));
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
