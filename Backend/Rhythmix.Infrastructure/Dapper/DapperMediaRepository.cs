
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

    public async Task<MediaItem?> GetByIdAsync(Guid mediaId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                MediaId, Title, Description, MediaType, Duration, 
                FilePath, ThumbnailUrl, MimeType, FileSize, 
                AlbumId, OwnerId, IsPublic, ViewCount, CreatedAt
            FROM [MediaItems]
            WHERE MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryFirstOrDefaultAsync<MediaItem>(sql, new { MediaId = mediaId }, transaction);
    }

    public async Task<IEnumerable<MediaItem>> GetByIdsAsync(IEnumerable<Guid> mediaIds, IDbTransaction? transaction = null)
    {
        if (mediaIds == null || !mediaIds.Any())
            return Enumerable.Empty<MediaItem>();

        const string sql = @"
            SELECT 
                MediaId, Title, Description, MediaType, Duration, 
                FilePath, ThumbnailUrl, MimeType, FileSize, 
                AlbumId, OwnerId, IsPublic, ViewCount, CreatedAt
            FROM [MediaItems]
            WHERE MediaId IN @Ids";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<MediaItem>(sql, new { Ids = mediaIds }, transaction);
    }

    public async Task<Guid> AddAsync(MediaItem media, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO [MediaItems] (
                MediaId, Title, Description, MediaType, Duration, 
                FilePath, ThumbnailUrl, MimeType, FileSize, 
                AlbumId, OwnerId, IsPublic, ViewCount, CreatedAt
            ) VALUES (
                @MediaId, @Title, @Description, @MediaType, @Duration, 
                @FilePath, @ThumbnailUrl, @MimeType, @FileSize, 
                @AlbumId, @OwnerId, @IsPublic, @ViewCount, @CreatedAt
            )";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, media, transaction);

        return media.MediaId;
    }

    public async Task UpdateAsync(MediaItem media, IDbTransaction? transaction = null)
    {
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
                IsPublic = @IsPublic
            WHERE MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, media, transaction);
    }

    public async Task DeleteAsync(Guid mediaId, IDbTransaction? transaction = null)
    {
        const string sql = "DELETE FROM [MediaItems] WHERE MediaId = @MediaId";
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new { MediaId = mediaId }, transaction);
    }

    public async Task<bool> ExistsAsync(Guid mediaId, IDbTransaction? transaction = null)
    {
        const string sql = "SELECT COUNT(1) FROM [MediaItems] WHERE MediaId = @MediaId";
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { MediaId = mediaId }, transaction);
        return count > 0;
    }

    public async Task<IEnumerable<MediaItem>> GetByOwnerIdAsync(Guid ownerId, int page = 1, int pageSize = 20, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                MediaId, Title, Description, MediaType, Duration, 
                FilePath, ThumbnailUrl, MimeType, FileSize, 
                AlbumId, OwnerId, IsPublic, ViewCount, CreatedAt
            FROM [MediaItems]
            WHERE OwnerId = @OwnerId
            ORDER BY CreatedAt DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<MediaItem>(sql, new
        {
            OwnerId = ownerId,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        }, transaction);
    }

    public async Task IncrementViewCountAsync(Guid mediaId, IDbTransaction? transaction = null)
    {
        const string sql = "UPDATE [MediaItems] SET ViewCount = ViewCount + 1 WHERE MediaId = @MediaId";
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new { MediaId = mediaId }, transaction);
    }
}