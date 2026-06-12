// Rhythmix.Infrastructure/Dapper/DapperMediaRepository.cs
using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Dapper;

public sealed class DapperMediaRepository : IMediaRepository
{
    private readonly string _connectionString;

    public DapperMediaRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    /// <inheritdoc />
    public async Task<MediaItem?> GetByIdAsync(Guid mediaId)
    {
        const string sql = @"
            SELECT 
                MediaId,
                Title,
                Description,
                MediaType,
                Duration,
                FilePath,
                ThumbnailUrl,
                MimeType,
                FileSize,
                AlbumId,
                OwnerId,
                IsPublic,
                ViewCount,
                CreatedAt,
            FROM [MediaItems]
            WHERE MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        return await connection.QueryFirstOrDefaultAsync<MediaItem>(
            sql,
            new { MediaId = mediaId });
    }

    /// <inheritdoc />
    public async Task<IEnumerable<MediaItem>> GetByIdsAsync(IEnumerable<Guid> mediaIds)
    {
        if (mediaIds == null || !mediaIds.Any())
        {
            return Enumerable.Empty<MediaItem>();
        }

        const string sql = @"
            SELECT 
                MediaId,
                Title,
                Description,
                MediaType,
                Duration,
                FilePath,
                ThumbnailUrl,
                MimeType,
                FileSize,
                AlbumId,
                OwnerId,
                IsPublic,
                ViewCount,
                CreatedAt
            FROM [MediaItems]
            WHERE MediaId IN @Ids";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        return await connection.QueryAsync<MediaItem>(
            sql,
            new { Ids = mediaIds });
    }

    /// <inheritdoc />
    public async Task<Guid> AddAsync(MediaItem media)
    {
        if (media == null) throw new ArgumentNullException(nameof(media));

        const string sql = @"
            INSERT INTO [MediaItems] (
                MediaId, 
                Title, 
                Description, 
                MediaType, 
                Duration, 
                FilePath, 
                ThumbnailUrl, 
                MimeType, 
                FileSize, 
                AlbumId, 
                OwnerId, 
                IsPublic, 
                ViewCount, 
                CreatedAt, 
            ) VALUES (
                @MediaId, 
                @Title, 
                @Description, 
                @MediaType, 
                @Duration, 
                @FilePath, 
                @ThumbnailUrl, 
                @MimeType, 
                @FileSize, 
                @AlbumId, 
                @OwnerId, 
                @IsPublic, 
                @ViewCount, 
                @CreatedAt, 
            )";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        await connection.ExecuteAsync(sql, new
        {
            media.MediaId,
            media.Title,
            media.Description,
            media.MediaType,
            media.Duration,
            media.FilePath,
            media.ThumbnailUrl,
            media.MimeType,
            media.FileSize,
            media.AlbumId,
            media.OwnerId,
            media.IsPublic,
            media.ViewCount,
            media.CreatedAt,
        });

        return media.MediaId;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(MediaItem media)
    {
        if (media == null) throw new ArgumentNullException(nameof(media));

        const string sql = @"
            UPDATE [MediaItems]
            SET Title = @Title,
                Description = @Description,
                MediaType = @MediaType,
                Duration = @Duration,
                FilePath = @FilePath,
                ThumbnailUrl = @ThumbnailUrl,
                MimeType = @MimeType,
                FileSize = @FileSize,
                AlbumId = @AlbumId,
                OwnerId = @OwnerId,
                IsPublic = @IsPublic,
                ViewCount = @ViewCount
            WHERE MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        int rowsAffected = await connection.ExecuteAsync(sql, new
        {
            media.Title,
            media.Description,
            media.MediaType,
            media.Duration,
            media.FilePath,
            media.ThumbnailUrl,
            media.MimeType,
            media.FileSize,
            media.AlbumId,
            media.OwnerId,
            media.IsPublic,
            media.ViewCount,
            media.MediaId
        });

        if (rowsAffected == 0)
        {
            throw new InvalidOperationException($"Media with ID {media.MediaId} not found for update");
        }
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid mediaId)
    {
        const string sql = @"
            DELETE FROM [MediaItems]
            WHERE MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        int rowsAffected = await connection.ExecuteAsync(sql, new { MediaId = mediaId });

        if (rowsAffected == 0)
        {
            throw new InvalidOperationException($"Media with ID {mediaId} not found for deletion");
        }
    }

    /// <summary>
    /// Kiểm tra media có tồn tại không
    /// </summary>
    public async Task<bool> ExistsAsync(Guid mediaId)
    {
        const string sql = @"
            SELECT COUNT(1)
            FROM [MediaItems]
            WHERE MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        int count = await connection.ExecuteScalarAsync<int>(sql, new { MediaId = mediaId });
        return count > 0;
    }

    /// <summary>
    /// Lấy tất cả media (có phân trang)
    /// </summary>
    public async Task<IEnumerable<MediaItem>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        const string sql = @"
            SELECT 
                MediaId,
                Title,
                Description,
                MediaType,
                Duration,
                FilePath,
                ThumbnailUrl,
                MimeType,
                FileSize,
                AlbumId,
                OwnerId,
                IsPublic,
                ViewCount,
                CreatedAt,
            FROM [MediaItems]
            ORDER BY CreatedAt DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        return await connection.QueryAsync<MediaItem>(sql, new
        {
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        });
    }

    /// <summary>
    /// Tìm kiếm media theo tên
    /// </summary>
    public async Task<IEnumerable<MediaItem>> SearchAsync(string keyword, int limit = 20)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return Enumerable.Empty<MediaItem>();
        }

        const string sql = @"
            SELECT TOP (@Limit)
                MediaId,
                Title,
                Description,
                MediaType,
                Duration,
                FilePath,
                ThumbnailUrl,
                MimeType,
                FileSize,
                AlbumId,
                OwnerId,
                IsPublic,
                ViewCount,
                CreatedAt,
            FROM [MediaItems]
            WHERE Title LIKE @Keyword
               OR Description LIKE @Keyword
            ORDER BY Title";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        return await connection.QueryAsync<MediaItem>(sql, new
        {
            Keyword = $"%{keyword.Trim()}%",
            Limit = limit
        });
    }
}