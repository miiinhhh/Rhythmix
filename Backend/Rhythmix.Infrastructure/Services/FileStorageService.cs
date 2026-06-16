using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _storagePath;
    private readonly string[] _allowedAudioExtensions = { ".mp3", ".wav", ".m4a", ".flac", ".ogg" };
    private readonly string[] _allowedVideoExtensions = { ".mp4", ".webm", ".mkv", ".avi", ".mov" };
    private readonly string[] _allowedMimeTypes = {
        "audio/mpeg", "audio/wav", "audio/mp4", "audio/flac", "audio/ogg",
        "video/mp4", "video/webm", "video/x-matroska", "video/x-msvideo", "video/quicktime"
    };

    public FileStorageService()
    {
        _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string subDirectory = "media")
    {
        var uploadDir = Path.Combine(_storagePath, subDirectory);
        if (!Directory.Exists(uploadDir))
        {
            Directory.CreateDirectory(uploadDir);
        }

        var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var filePath = Path.Combine(uploadDir, safeFileName);

        using var fileStreamOutput = new FileStream(filePath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(fileStreamOutput);

        return $"/uploads/{subDirectory}/{safeFileName}";
    }

    public async Task<Stream?> GetFileStreamAsync(string filePath)
    {
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        
        if (!File.Exists(fullPath))
        {
            return null;
        }

        return new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        
        if (!File.Exists(fullPath))
        {
            return false;
        }

        File.Delete(fullPath);
        return await Task.FromResult(true);
    }

    public string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLower();
        return extension switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".m4a" => "audio/mp4",
            ".flac" => "audio/flac",
            ".ogg" => "audio/ogg",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".mkv" => "video/x-matroska",
            ".avi" => "video/x-msvideo",
            ".mov" => "video/quicktime",
            _ => "application/octet-stream"
        };
    }

    public bool IsValidMediaFile(string fileName, string contentType, out string mediaType)
    {
        var extension = Path.GetExtension(fileName).ToLower();
        
        if (_allowedAudioExtensions.Contains(extension) )
        {
            mediaType = "audio";
            return true;
        }
        
        if (_allowedVideoExtensions.Contains(extension))
        {
            mediaType = "video";
            return true;
        }
        
        mediaType = string.Empty;
        return false;
    }
}