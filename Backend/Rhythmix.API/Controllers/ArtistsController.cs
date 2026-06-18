using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Application.Common.Models;
using Rhythmix.Application.DTOs.Media;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ArtistsController : ControllerBase
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IFileStorageService _fileStorageService;

    public ArtistsController(IDbConnectionFactory connectionFactory, IFileStorageService fileStorageService)
    {
        _connectionFactory = connectionFactory;
        _fileStorageService = fileStorageService;
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchArtists([FromQuery] string q = "")
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT TOP 20
                a.ArtistId,
                a.Name,
                a.Description,
                a.AvatarUrl,
                a.CoverImageUrl,
                a.CreatedAt,
                COUNT(DISTINCT m.MediaId) AS TrackCount,
                COUNT(DISTINCT af.UserId) AS FollowerCount
            FROM Artists a
            LEFT JOIN MediaItems m ON m.ArtistId = a.ArtistId AND m.IsPublic = 1
            LEFT JOIN ArtistFollows af ON af.ArtistId = a.ArtistId
            WHERE @Query = '' OR a.Name LIKE @LikeQuery OR a.Description LIKE @LikeQuery
            GROUP BY a.ArtistId, a.Name, a.Description, a.AvatarUrl, a.CoverImageUrl, a.CreatedAt
            ORDER BY COUNT(DISTINCT m.MediaId) DESC, a.Name";

        var artists = await connection.QueryAsync<ArtistSearchItem>(sql, new
        {
            Query = q.Trim(),
            LikeQuery = $"%{q.Trim()}%"
        });

        return Ok(ApiResponse<object>.ToSuccess(artists));
    }

    [HttpGet("{artistId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetArtist(Guid artistId)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT
                a.ArtistId,
                a.Name,
                a.Description,
                a.AvatarUrl,
                a.CoverImageUrl,
                a.CreatedAt,
                COUNT(DISTINCT m.MediaId) AS TrackCount,
                COUNT(DISTINCT af.UserId) AS FollowerCount
            FROM Artists a
            LEFT JOIN MediaItems m ON m.ArtistId = a.ArtistId AND m.IsPublic = 1
            LEFT JOIN ArtistFollows af ON af.ArtistId = a.ArtistId
            WHERE a.ArtistId = @ArtistId
            GROUP BY a.ArtistId, a.Name, a.Description, a.AvatarUrl, a.CoverImageUrl, a.CreatedAt";

        var artist = await connection.QuerySingleOrDefaultAsync<ArtistSearchItem>(sql, new { ArtistId = artistId });
        if (artist == null)
        {
            return NotFound(ApiResponse<object>.ToFailure("Artist not found."));
        }

        return Ok(ApiResponse<object>.ToSuccess(artist));
    }

    [HttpGet("{artistId:guid}/media")]
    [AllowAnonymous]
    public async Task<IActionResult> GetArtistMedia(Guid artistId)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT
                m.MediaId,
                m.Title,
                m.Description,
                m.MediaType,
                m.Duration,
                m.FilePath,
                m.ThumbnailUrl,
                m.MimeType,
                m.FileSize,
                m.ArtistId,
                a.Name AS ArtistName,
                m.AlbumId,
                m.GenreId,
                m.OwnerId,
                m.IsPublic,
                m.ViewCount,
                m.CreatedAt
            FROM MediaItems m
            INNER JOIN Artists a ON a.ArtistId = m.ArtistId
            WHERE m.ArtistId = @ArtistId AND m.IsPublic = 1
            ORDER BY m.CreatedAt DESC, m.Title";

        var media = await connection.QueryAsync<MediaDto>(sql, new { ArtistId = artistId });
        return Ok(ApiResponse<object>.ToSuccess(media));
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateArtist([FromForm] CreateArtistRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiResponse<object>.ToFailure("Artist name is required."));
        }

        var name = request.Name.Trim();
        using var connection = _connectionFactory.CreateConnection();

        var existing = await connection.QuerySingleOrDefaultAsync<ArtistSearchItem>(
            "SELECT ArtistId, Name, Description, AvatarUrl, CoverImageUrl, CreatedAt FROM Artists WHERE LOWER(Name) = LOWER(@Name)",
            new { Name = name });

        if (existing != null)
        {
            return Conflict(ApiResponse<object>.ToFailure("Artist name already exists."));
        }

        string? avatarUrl = null;
        if (request.AvatarImage is { Length: > 0 })
        {
            avatarUrl = await SaveImageAsync(request.AvatarImage);
        }

        var artist = new ArtistSearchItem
        {
            ArtistId = Guid.NewGuid(),
            Name = name,
            Description = request.Description?.Trim(),
            AvatarUrl = avatarUrl,
            CreatedAt = DateTime.UtcNow
        };

        await connection.ExecuteAsync(
            @"INSERT INTO Artists (ArtistId, Name, Description, AvatarUrl, CoverImageUrl, CreatedAt)
              VALUES (@ArtistId, @Name, @Description, @AvatarUrl, @CoverImageUrl, @CreatedAt)",
            artist);

        return Ok(ApiResponse<object>.ToSuccess(artist));
    }

    [HttpPost("{artistId:guid}/cover")]
    [Authorize]
    public async Task<IActionResult> UploadArtistCover(Guid artistId, [FromForm] IFormFile coverImage)
    {
        if (coverImage == null || coverImage.Length == 0)
        {
            return BadRequest(ApiResponse<object>.ToFailure("No cover image uploaded."));
        }

        var extension = Path.GetExtension(coverImage.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(ApiResponse<object>.ToFailure("Invalid cover image format. Only jpg, png and webp files are allowed."));
        }

        using var connection = _connectionFactory.CreateConnection();
        var artistExists = await connection.ExecuteScalarAsync<bool>(
            "SELECT COUNT(1) FROM Artists WHERE ArtistId = @ArtistId",
            new { ArtistId = artistId });

        if (!artistExists)
        {
            return NotFound(ApiResponse<object>.ToFailure("Artist not found."));
        }

        var coverImageUrl = await SaveImageAsync(coverImage);

        await connection.ExecuteAsync(
            "UPDATE Artists SET CoverImageUrl = @CoverImageUrl WHERE ArtistId = @ArtistId",
            new { ArtistId = artistId, CoverImageUrl = coverImageUrl });

        return Ok(ApiResponse<object>.ToSuccess(new { CoverImageUrl = coverImageUrl }));
    }

    private async Task<string> SaveImageAsync(IFormFile image)
    {
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Invalid image format. Only jpg, png and webp files are allowed.");
        }

        await using var stream = image.OpenReadStream();
        return await _fileStorageService.SaveFileAsync(stream, image.FileName, "images");
    }

    public sealed class CreateArtistRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public IFormFile? AvatarImage { get; set; }
    }

    private sealed class ArtistSearchItem
    {
        public Guid ArtistId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? AvatarUrl { get; set; }
        public string? CoverImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TrackCount { get; set; }
        public int FollowerCount { get; set; }
    }
}
