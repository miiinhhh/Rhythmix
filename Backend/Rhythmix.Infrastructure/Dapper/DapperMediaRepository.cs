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
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var videoColumns = await HasVideoColumnsAsync(connection, transaction)
            ? "m.VideoFilePath, m.VideoMimeType, m.VideoFileSize,"
            : "CAST(NULL AS nvarchar(500)) AS VideoFilePath, CAST(NULL AS nvarchar(100)) AS VideoMimeType, CAST(NULL AS bigint) AS VideoFileSize,";

        var sql = $@"
            SELECT 
                m.MediaId, m.Title, m.Description, m.MediaType, m.Duration, 
                m.FilePath, m.ThumbnailUrl, m.MimeType, m.FileSize, {videoColumns}
                m.ArtistId, a.Name AS ArtistName, m.AlbumId, al.Title AS AlbumTitle, m.GenreId,
                m.OwnerId, m.IsPublic, m.ViewCount, m.CreatedAt
            FROM [MediaItems] m
            LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
            LEFT JOIN [Albums] al ON al.AlbumId = m.AlbumId
            WHERE m.MediaId = @MediaId";

        return await connection.QueryFirstOrDefaultAsync<MediaItem>(sql, new { MediaId = mediaId }, transaction);
    }

    public async Task<IEnumerable<MediaItem>> GetByIdsAsync(IEnumerable<Guid> mediaIds, IDbTransaction? transaction = null)
    {
        if (mediaIds == null || !mediaIds.Any())
            return Enumerable.Empty<MediaItem>();

        const string sql = @"
            SELECT 
                m.MediaId, m.Title, m.Description, m.MediaType, m.Duration, 
                m.FilePath, m.ThumbnailUrl, m.MimeType, m.FileSize, 
                m.VideoFilePath, m.VideoMimeType, m.VideoFileSize,
                m.ArtistId, a.Name AS ArtistName, m.AlbumId, al.Title AS AlbumTitle, m.GenreId,
                m.OwnerId, m.IsPublic, m.ViewCount, m.CreatedAt
            FROM [MediaItems] m
            LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
            LEFT JOIN [Albums] al ON al.AlbumId = m.AlbumId
            WHERE m.MediaId IN @Ids";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<MediaItem>(sql, new { Ids = mediaIds }, transaction);
    }

    public async Task<Guid> AddAsync(MediaItem media, IDbTransaction? transaction = null)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var hasVideoColumns = await HasVideoColumnsAsync(connection, transaction);
        var sql = hasVideoColumns
            ? @"
            INSERT INTO [MediaItems] (
                MediaId, Title, Description, MediaType, Duration, 
                FilePath, ThumbnailUrl, MimeType, FileSize, 
                VideoFilePath, VideoMimeType, VideoFileSize,
                ArtistId, AlbumId, GenreId, OwnerId, IsPublic, ViewCount, CreatedAt
            ) VALUES (
                @MediaId, @Title, @Description, @MediaType, @Duration, 
                @FilePath, @ThumbnailUrl, @MimeType, @FileSize, 
                @VideoFilePath, @VideoMimeType, @VideoFileSize,
                @ArtistId, @AlbumId, @GenreId, @OwnerId, @IsPublic, @ViewCount, @CreatedAt
            )"
            : @"
            INSERT INTO [MediaItems] (
                MediaId, Title, Description, MediaType, Duration, 
                FilePath, ThumbnailUrl, MimeType, FileSize, 
                ArtistId, AlbumId, GenreId, OwnerId, IsPublic, ViewCount, CreatedAt
            ) VALUES (
                @MediaId, @Title, @Description, @MediaType, @Duration, 
                @FilePath, @ThumbnailUrl, @MimeType, @FileSize, 
                @ArtistId, @AlbumId, @GenreId, @OwnerId, @IsPublic, @ViewCount, @CreatedAt
            )";

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
                ArtistId = @ArtistId,
                AlbumId = @AlbumId,
                GenreId = @GenreId,
                IsPublic = @IsPublic
            WHERE MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, media, transaction);
    }

    public async Task SetGenresAsync(Guid mediaId, IEnumerable<Guid> genreIds, IDbTransaction? transaction = null)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        await connection.ExecuteAsync(
            "DELETE FROM [MediaItemGenres] WHERE MediaId = @MediaId",
            new { MediaId = mediaId },
            transaction);

        var distinctGenreIds = genreIds.Distinct().ToArray();
        if (distinctGenreIds.Length == 0)
        {
            return;
        }

        const string sql = @"
            INSERT INTO [MediaItemGenres] (MediaId, GenreId)
            VALUES (@MediaId, @GenreId)";

        await connection.ExecuteAsync(
            sql,
            distinctGenreIds.Select(genreId => new { MediaId = mediaId, GenreId = genreId }),
            transaction);
    }

    public async Task DeleteAsync(Guid mediaId, IDbTransaction? transaction = null)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var deleteTransaction = await connection.BeginTransactionAsync();

        try
        {
            var parameters = new { MediaId = mediaId };

            // Older database scripts do not consistently declare cascade deletes.
            // Remove every media-dependent record before deleting the media item.
            await connection.ExecuteAsync("DELETE FROM [MediaShares] WHERE MediaId = @MediaId", parameters, deleteTransaction);
            await connection.ExecuteAsync("DELETE FROM [Favorites] WHERE MediaId = @MediaId", parameters, deleteTransaction);
            await connection.ExecuteAsync("DELETE FROM [PlayHistories] WHERE MediaId = @MediaId", parameters, deleteTransaction);
            await connection.ExecuteAsync("DELETE FROM [PlayListTrack] WHERE MediaId = @MediaId", parameters, deleteTransaction);
            await connection.ExecuteAsync("DELETE FROM [MediaItemGenres] WHERE MediaId = @MediaId", parameters, deleteTransaction);
            await connection.ExecuteAsync("DELETE FROM [MediaItems] WHERE MediaId = @MediaId", parameters, deleteTransaction);

            await deleteTransaction.CommitAsync();
        }
        catch
        {
            await deleteTransaction.RollbackAsync();
            throw;
        }
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
                m.MediaId, m.Title, m.Description, m.MediaType, m.Duration, 
                m.FilePath, m.ThumbnailUrl, m.MimeType, m.FileSize, 
                m.VideoFilePath, m.VideoMimeType, m.VideoFileSize,
                m.ArtistId, a.Name AS ArtistName, m.AlbumId, al.Title AS AlbumTitle, m.GenreId,
                m.OwnerId, m.IsPublic, m.ViewCount, m.CreatedAt
            FROM [MediaItems] m
            LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
            LEFT JOIN [Albums] al ON al.AlbumId = m.AlbumId
            WHERE m.OwnerId = @OwnerId
            ORDER BY m.CreatedAt DESC
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

    public async Task<IEnumerable<MediaItem>> GetByAlbumIdAsync(Guid albumId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT
                m.MediaId, m.Title, m.Description, m.MediaType, m.Duration,
                m.FilePath, m.ThumbnailUrl, m.MimeType, m.FileSize,
                m.VideoFilePath, m.VideoMimeType, m.VideoFileSize,
                m.ArtistId, a.Name AS ArtistName, m.AlbumId, al.Title AS AlbumTitle, m.GenreId,
                m.OwnerId, m.IsPublic, m.ViewCount, m.CreatedAt
            FROM [MediaItems] m
            LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
            LEFT JOIN [Albums] al ON al.AlbumId = m.AlbumId
            WHERE m.AlbumId = @AlbumId
            ORDER BY m.CreatedAt ASC";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<MediaItem>(sql, new { AlbumId = albumId }, transaction);
    }

    public async Task<IEnumerable<MediaItem>> GetRecentAsync(int page = 1, int pageSize = 20, IDbTransaction? transaction = null)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var hasIsPublicColumn = await connection.ExecuteScalarAsync<int>(
            "SELECT CASE WHEN COL_LENGTH('MediaItems', 'IsPublic') IS NULL THEN 0 ELSE 1 END",
            transaction: transaction) == 1;

        var sql = hasIsPublicColumn
            ? @"
                SELECT 
                    m.MediaId, m.Title, m.Description, m.MediaType, m.Duration, 
                    m.FilePath, m.ThumbnailUrl, m.MimeType, m.FileSize, 
                    m.VideoFilePath, m.VideoMimeType, m.VideoFileSize,
                    m.ArtistId, a.Name AS ArtistName, m.AlbumId, al.Title AS AlbumTitle, m.GenreId,
                    m.OwnerId, m.IsPublic, m.ViewCount, m.CreatedAt
                FROM [MediaItems] m
                LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
                LEFT JOIN [Albums] al ON al.AlbumId = m.AlbumId
                WHERE m.IsPublic = 1
                ORDER BY m.CreatedAt DESC
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY"
            : @"
                SELECT 
                    m.MediaId, m.Title, m.Description, m.MediaType, m.Duration, 
                    m.FilePath, m.ThumbnailUrl, m.MimeType, m.FileSize, 
                    m.VideoFilePath, m.VideoMimeType, m.VideoFileSize,
                    m.ArtistId, a.Name AS ArtistName, m.AlbumId, al.Title AS AlbumTitle, m.GenreId,
                    m.OwnerId, CAST(1 AS bit) AS IsPublic, m.ViewCount, m.CreatedAt
                FROM [MediaItems] m
                LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
                LEFT JOIN [Albums] al ON al.AlbumId = m.AlbumId
                ORDER BY m.CreatedAt DESC
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY";

        return await connection.QueryAsync<MediaItem>(sql, new
        {
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

    private static async Task<bool> HasVideoColumnsAsync(SqlConnection connection, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT CASE WHEN
                COL_LENGTH('MediaItems', 'VideoFilePath') IS NOT NULL AND
                COL_LENGTH('MediaItems', 'VideoMimeType') IS NOT NULL AND
                COL_LENGTH('MediaItems', 'VideoFileSize') IS NOT NULL
            THEN 1 ELSE 0 END";

        return await connection.ExecuteScalarAsync<int>(sql, transaction: transaction) == 1;
    }
}
