// Rhythmix.Infrastructure/Dapper/DapperAlbumRepository.cs
using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Dapper;

public sealed class DapperAlbumRepository : IAlbumRepository
{
    private readonly string _connectionString;

    public DapperAlbumRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    public async Task<Album?> GetByIdAsync(Guid albumId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                AlbumId,
                OwnerId,
                Title,
                Description,
                CoverImageUrl,
                ReleaseDate,
                CreatedAt
            FROM [Albums]
            WHERE AlbumId = @AlbumId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryFirstOrDefaultAsync<Album>(sql, new { AlbumId = albumId }, transaction);
    }

    public async Task<IEnumerable<Album>> GetByOwnerIdAsync(Guid ownerId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                AlbumId,
                OwnerId,
                Title,
                Description,
                CoverImageUrl,
                ReleaseDate,
                CreatedAt
            FROM [Albums]
            WHERE OwnerId = @OwnerId
            ORDER BY CreatedAt DESC";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<Album>(sql, new { OwnerId = ownerId }, transaction);
    }

    public async Task<IEnumerable<Album>> GetPublicAlbumsAsync(int page = 1, int pageSize = 20, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                AlbumId,
                OwnerId,
                Title,
                Description,
                CoverImageUrl,
                ReleaseDate,
                CreatedAt
            FROM [Albums]
            ORDER BY CreatedAt DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<Album>(sql, new
        {
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        }, transaction);
    }

    public async Task<Guid> CreateAsync(Album album, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO [Albums] (AlbumId, OwnerId, Title, Description, CoverImageUrl, ReleaseDate, CreatedAt)
            VALUES (@AlbumId, @OwnerId, @Title, @Description, @CoverImageUrl, @ReleaseDate, @CreatedAt)";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new
        {
            album.AlbumId,
            album.OwnerId,
            album.Title,
            album.Description,
            album.CoverImageUrl,
            album.ReleaseDate,
            album.CreatedAt
        }, transaction);

        return album.AlbumId;
    }

    public async Task UpdateAsync(Album album, IDbTransaction? transaction = null)
    {
        const string sql = @"
            UPDATE [Albums]
            SET Title = @Title,
                Description = @Description,
                CoverImageUrl = @CoverImageUrl,
                ReleaseDate = @ReleaseDate
            WHERE AlbumId = @AlbumId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new
        {
            album.Title,
            album.Description,
            album.CoverImageUrl,
            album.ReleaseDate,
            album.AlbumId
        }, transaction);
    }

    public async Task DeleteAsync(Guid albumId, IDbTransaction? transaction = null)
    {
        // Có thể xóa hoặc update MediaItems để null AlbumId
        const string updateMediaSql = @"UPDATE [MediaItems] SET AlbumId = NULL WHERE AlbumId = @AlbumId";
        const string deleteSql = @"DELETE FROM [Albums] WHERE AlbumId = @AlbumId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var localTransaction = transaction ?? connection.BeginTransaction();

        try
        {
            await connection.ExecuteAsync(updateMediaSql, new { AlbumId = albumId }, localTransaction);
            await connection.ExecuteAsync(deleteSql, new { AlbumId = albumId }, localTransaction);

            if (transaction is null)
            {
                localTransaction.Commit();
            }
        }
        catch
        {
            if (transaction is null)
            {
                localTransaction.Rollback();
            }
            throw;
        }
    }

    public async Task<bool> ExistsAsync(Guid albumId, IDbTransaction? transaction = null)
    {
        const string sql = "SELECT COUNT(1) FROM [Albums] WHERE AlbumId = @AlbumId";
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { AlbumId = albumId }, transaction);
        return count > 0;
    }

    public async Task<int> GetTrackCountAsync(Guid albumId, IDbTransaction? transaction = null)
    {
        const string sql = "SELECT COUNT(1) FROM [MediaItems] WHERE AlbumId = @AlbumId";
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.ExecuteScalarAsync<int>(sql, new { AlbumId = albumId }, transaction);
    }
}