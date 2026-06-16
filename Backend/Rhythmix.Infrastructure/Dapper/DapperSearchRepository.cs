// Rhythmix.Infrastructure/Dapper/DapperSearchRepository.cs
using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Dapper;

public sealed class DapperSearchRepository : ISearchRepository
{
    private readonly string _connectionString;

    public DapperSearchRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    /// <summary>
    /// Tìm kiếm bài hát theo tên, nghệ sĩ hoặc album
    public async Task<(IEnumerable<MediaItem> Items, int TotalCount)> SearchMediaAsync(
        string query, int page = 1, int pageSize = 10, IDbTransaction? transaction = null)
    {
        const string countSql = @"
            SELECT COUNT(1)
            FROM [MediaItems] m
            WHERE m.IsPublic = 1 
                AND (m.Title LIKE @Query 
                     OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = m.OwnerId AND u.UserName LIKE @Query))";

        const string dataSql = @"
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
                m.AlbumId,
                m.GenreId,
                m.OwnerId,
                m.IsPublic,
                m.ViewCount,
                m.CreatedAt
            FROM [MediaItems] m
            WHERE m.IsPublic = 1 
                AND (m.Title LIKE @Query 
                     OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = m.OwnerId AND u.UserName LIKE @Query))
            ORDER BY m.ViewCount DESC, m.CreatedAt DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var queryParam = $"%{query}%";
        int totalCount = await connection.ExecuteScalarAsync<int>(countSql, new { Query = queryParam }, transaction);

        var items = await connection.QueryAsync<MediaItem>(dataSql, new
        {
            Query = queryParam,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        }, transaction);

        return (items, totalCount);
    }

    /// <summary>
    /// Tìm kiếm playlist theo tên hoặc tên chủ sở hữu
    public async Task<(IEnumerable<Playlist> Items, int TotalCount)> SearchPlaylistAsync(
        string query, int page = 1, int pageSize = 10, IDbTransaction? transaction = null)
    {
        const string countSql = @"
            SELECT COUNT(1)
            FROM [Playlists] p
            WHERE p.IsPublic = 1 
                AND (p.Name LIKE @Query 
                     OR p.Description LIKE @Query
                     OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = p.OwnerId AND u.UserName LIKE @Query))";

        const string dataSql = @"
            SELECT 
                p.PlaylistId AS Id,
                p.Name,
                p.Description,
                p.IsPublic,
                p.OwnerId,
                p.CreatedAt
            FROM [Playlists] p
            WHERE p.IsPublic = 1 
                AND (p.Name LIKE @Query 
                     OR p.Description LIKE @Query
                     OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = p.OwnerId AND u.UserName LIKE @Query))
            ORDER BY p.CreatedAt DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var queryParam = $"%{query}%";
        int totalCount = await connection.ExecuteScalarAsync<int>(countSql, new { Query = queryParam }, transaction);

        var items = await connection.QueryAsync<Playlist>(dataSql, new
        {
            Query = queryParam,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        }, transaction);

        return (items, totalCount);
    }

    /// <summary>
    /// Lấy tất cả các playlist công khai với phân trang
    public async Task<(IEnumerable<Playlist> Items, int TotalCount)> GetPublicPlaylistsAsync(
        int page = 1, int pageSize = 10, IDbTransaction? transaction = null)
    {
        const string countSql = @"SELECT COUNT(1) FROM [Playlists] WHERE IsPublic = 1";

        const string dataSql = @"
            SELECT 
                PlaylistId AS Id, 
                Name, 
                Description, 
                IsPublic, 
                OwnerId, 
                CreatedAt
            FROM [Playlists]
            WHERE IsPublic = 1
            ORDER BY CreatedAt DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        int totalCount = await connection.ExecuteScalarAsync<int>(countSql, transaction: transaction);

        var items = await connection.QueryAsync<Playlist>(dataSql, new
        {
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        }, transaction);

        return (items, totalCount);
    }

    /// <summary>
    /// Lấy tất cả các bài hát công khai với phân trang
    public async Task<(IEnumerable<MediaItem> Items, int TotalCount)> GetPublicMediaAsync(
        int page = 1, int pageSize = 10, IDbTransaction? transaction = null)
    {
        const string countSql = @"SELECT COUNT(1) FROM [MediaItems] WHERE IsPublic = 1";

        const string dataSql = @"
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
                GenreId,
                OwnerId,
                IsPublic,
                ViewCount,
                CreatedAt
            FROM [MediaItems]
            WHERE IsPublic = 1
            ORDER BY ViewCount DESC, CreatedAt DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        int totalCount = await connection.ExecuteScalarAsync<int>(countSql, transaction: transaction);

        var items = await connection.QueryAsync<MediaItem>(dataSql, new
        {
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        }, transaction);

        return (items, totalCount);
    }
}