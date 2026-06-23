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
        if (string.IsNullOrWhiteSpace(query))
        {
            return (Enumerable.Empty<MediaItem>(), 0);
        }

        const string countSql = @"
            SELECT COUNT(DISTINCT m.MediaId)
            FROM [MediaItems] m
            LEFT JOIN [MediaItemGenres] mig ON mig.MediaId = m.MediaId
            LEFT JOIN [Genres] g ON g.GenreId = COALESCE(mig.GenreId, m.GenreId)
            LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
            WHERE m.IsPublic = 1 
                AND (
                    (@UseExactGenre = 1 AND LOWER(g.Name) = LOWER(@ExactQuery))
                    OR
                    (@UseExactGenre = 0 AND (
                        m.Title LIKE @Query
                        OR a.Name LIKE @Query
                        OR g.Name LIKE @Query
                        OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = m.OwnerId AND u.UserName LIKE @Query)
                    ))
                )";

        const string dataSql = @"
            SELECT DISTINCT
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
                al.Title AS AlbumTitle,
                m.GenreId,
                m.OwnerId,
                m.IsPublic,
                m.ViewCount,
                m.CreatedAt
            FROM [MediaItems] m
            LEFT JOIN [MediaItemGenres] mig ON mig.MediaId = m.MediaId
            LEFT JOIN [Genres] g ON g.GenreId = COALESCE(mig.GenreId, m.GenreId)
            LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
            LEFT JOIN [Albums] al ON al.AlbumId = m.AlbumId
            WHERE m.IsPublic = 1 
                AND (
                    (@UseExactGenre = 1 AND LOWER(g.Name) = LOWER(@ExactQuery))
                    OR
                    (@UseExactGenre = 0 AND (
                        m.Title LIKE @Query
                        OR a.Name LIKE @Query
                        OR g.Name LIKE @Query
                        OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = m.OwnerId AND u.UserName LIKE @Query)
                    ))
                )
            ORDER BY m.ViewCount DESC, m.CreatedAt DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var queryParam = $"%{query}%";
        var exactQuery = query.Trim();
        var useExactGenre = await connection.ExecuteScalarAsync<int>(
            "SELECT CASE WHEN EXISTS (SELECT 1 FROM [Genres] WHERE LOWER(Name) = LOWER(@ExactQuery)) THEN 1 ELSE 0 END",
            new { ExactQuery = exactQuery },
            transaction) == 1;

        var parameters = new { Query = queryParam, ExactQuery = exactQuery, UseExactGenre = useExactGenre ? 1 : 0 };
        int totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters, transaction);

        var items = await connection.QueryAsync<MediaItem>(dataSql, new
        {
            parameters.Query,
            parameters.ExactQuery,
            parameters.UseExactGenre,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        }, transaction);

        return (items, totalCount);
    }

    public async Task<IEnumerable<(Genre Genre, IEnumerable<MediaItem> Tracks)>> SearchGenrePlaylistsAsync(
        string query,
        int tracksPerGenre = 10,
        IDbTransaction? transaction = null)
    {

        if (string.IsNullOrWhiteSpace(query))
        {
            return Enumerable.Empty<(Genre Genre, IEnumerable<MediaItem> Tracks)>();
        }

        const string sql = @"
            SELECT
                g.GenreId,
                g.Name,
                g.Description,
                g.CreatedAt,
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
                al.Title AS AlbumTitle,
                m.GenreId,
                m.OwnerId,
                m.IsPublic,
                m.ViewCount,
                m.CreatedAt
            FROM [Genres] g
            INNER JOIN [MediaItemGenres] mig ON mig.GenreId = g.GenreId
            INNER JOIN [MediaItems] m ON m.MediaId = mig.MediaId AND m.IsPublic = 1
            LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
            LEFT JOIN [Albums] al ON al.AlbumId = m.AlbumId
            WHERE LOWER(g.Name) = LOWER(@ExactQuery)
            ORDER BY g.Name, m.ViewCount DESC, m.CreatedAt DESC";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var exactQuery = query.Trim();
        var grouped = new Dictionary<Guid, (Genre Genre, List<MediaItem> Tracks)>();

        await connection.QueryAsync<Genre, MediaItem, Genre>(
            sql,
            (genre, media) =>
            {
                if (!grouped.TryGetValue(genre.GenreId, out var entry))
                {
                    entry = (genre, new List<MediaItem>());
                    grouped.Add(genre.GenreId, entry);
                }

                if (entry.Tracks.Count < tracksPerGenre)
                {
                    entry.Tracks.Add(media);
                }

                return genre;
            },
            new { ExactQuery = exactQuery },
            transaction,
            splitOn: "MediaId");

        return grouped.Values.Select(x => (x.Genre, x.Tracks.AsEnumerable()));
    }

    /// <summary>
    /// Tìm kiếm playlist theo tên hoặc tên chủ sở hữu
    public async Task<(IEnumerable<Playlist> Items, int TotalCount)> SearchPlaylistAsync(
    string query, int page = 1, int pageSize = 10, IDbTransaction? transaction = null)
    {


        if (string.IsNullOrWhiteSpace(query))
        {
            return (Enumerable.Empty<Playlist>(), 0);
        }

        const string countSql = @"
        SELECT COUNT(1)
        FROM [Playlists] p
        WHERE p.IsPublic = 1 
            AND (p.Name LIKE @Query 
                 OR p.Description LIKE @Query
                 OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = p.OwnerId AND u.UserName LIKE @Query))";

        // ✅ SQL có JOIN với PlayListTrack để đếm số lượng track
        const string dataSql = @"
        SELECT 
            p.PlaylistId AS Id,
            p.Name,
            p.Description,
            p.IsPublic,
            p.OwnerId,
            p.CreatedAt,
            COUNT(pt.MediaId) AS TrackCount
        FROM [Playlists] p
        LEFT JOIN [PlayListTrack] pt ON p.PlaylistId = pt.PlaylistId
        WHERE p.IsPublic = 1 
            AND (p.Name LIKE @Query 
                 OR p.Description LIKE @Query
                 OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = p.OwnerId AND u.UserName LIKE @Query))
        GROUP BY p.PlaylistId, p.Name, p.Description, p.IsPublic, p.OwnerId, p.CreatedAt
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

        // ✅ SỬA: Thêm COUNT(pt.MediaId) AS TrackCount
        const string dataSql = @"
        SELECT 
            p.PlaylistId AS Id, 
            p.Name, 
            p.Description, 
            p.IsPublic, 
            p.OwnerId, 
            p.CreatedAt,
            COUNT(pt.MediaId) AS TrackCount
        FROM [Playlists] p
        LEFT JOIN [PlayListTrack] pt ON p.PlaylistId = pt.PlaylistId
        WHERE p.IsPublic = 1
        GROUP BY p.PlaylistId, p.Name, p.Description, p.IsPublic, p.OwnerId, p.CreatedAt
        ORDER BY p.CreatedAt DESC
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
                al.Title AS AlbumTitle,
                m.GenreId,
                m.OwnerId,
                m.IsPublic,
                m.ViewCount,
                m.CreatedAt
            FROM [MediaItems] m
            LEFT JOIN [Artists] a ON a.ArtistId = m.ArtistId
            LEFT JOIN [Albums] al ON al.AlbumId = m.AlbumId
            WHERE m.IsPublic = 1
            ORDER BY m.ViewCount DESC, m.CreatedAt DESC
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

    /// <summary>
    /// Tìm kiếm album theo tên hoặc tên chủ sở hữu/nghệ sĩ
    /// </summary>
    public async Task<(IEnumerable<Album> Items, int TotalCount)> SearchAlbumAsync(
        string query, int page = 1, int pageSize = 10, IDbTransaction? transaction = null)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return (Enumerable.Empty<Album>(), 0);
        }

        const string countSql = @"
        SELECT COUNT(1)
        FROM [Albums] a
        WHERE (a.Title LIKE @Query 
             OR a.Description LIKE @Query
             OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = a.OwnerId AND u.UserName LIKE @Query)
             OR EXISTS (SELECT 1 FROM [MediaItems] m 
                         LEFT JOIN [Artists] art ON art.ArtistId = m.ArtistId 
                         WHERE m.AlbumId = a.AlbumId AND art.Name LIKE @Query))";

        const string dataSql = @"
        SELECT 
            a.AlbumId,
            a.Title,
            a.Description,
            a.CoverImageUrl,
            a.OwnerId,
            a.CreatedAt,
            COUNT(m.MediaId) AS TrackCount,
            (SELECT TOP 1 art.Name FROM [MediaItems] m2 LEFT JOIN [Artists] art ON art.ArtistId = m2.ArtistId WHERE m2.AlbumId = a.AlbumId) AS ArtistName
        FROM [Albums] a
        LEFT JOIN [MediaItems] m ON m.AlbumId = a.AlbumId
        WHERE (a.Title LIKE @Query 
             OR a.Description LIKE @Query
             OR EXISTS (SELECT 1 FROM AspNetUsers u WHERE u.Id = a.OwnerId AND u.UserName LIKE @Query)
             OR EXISTS (SELECT 1 FROM [MediaItems] m3 
                         LEFT JOIN [Artists] art ON art.ArtistId = m3.ArtistId 
                         WHERE m3.AlbumId = a.AlbumId AND art.Name LIKE @Query))
        GROUP BY a.AlbumId, a.Title, a.Description, a.CoverImageUrl, a.OwnerId, a.CreatedAt
        ORDER BY a.CreatedAt DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var queryParam = $"%{query}%";
        int totalCount = await connection.ExecuteScalarAsync<int>(countSql, new { Query = queryParam }, transaction);

        var items = await connection.QueryAsync<Album>(dataSql, new
        {
            Query = queryParam,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        }, transaction);

        return (items, totalCount);
    }

    /// <summary>
    /// Lấy tất cả các album với phân trang
    /// </summary>
    public async Task<(IEnumerable<Album> Items, int TotalCount)> GetPublicAlbumsAsync(
        int page = 1, int pageSize = 10, IDbTransaction? transaction = null)
    {
        const string countSql = @"SELECT COUNT(1) FROM [Albums]";

        const string dataSql = @"
        SELECT 
            a.AlbumId,
            a.Title,
            a.Description,
            a.CoverImageUrl,
            a.OwnerId,
            a.CreatedAt,
            COUNT(m.MediaId) AS TrackCount,
            (SELECT TOP 1 art.Name FROM [MediaItems] m2 LEFT JOIN [Artists] art ON art.ArtistId = m2.ArtistId WHERE m2.AlbumId = a.AlbumId) AS ArtistName
        FROM [Albums] a
        LEFT JOIN [MediaItems] m ON m.AlbumId = a.AlbumId
        GROUP BY a.AlbumId, a.Title, a.Description, a.CoverImageUrl, a.OwnerId, a.CreatedAt
        ORDER BY a.CreatedAt DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        int totalCount = await connection.ExecuteScalarAsync<int>(countSql, transaction: transaction);

        var items = await connection.QueryAsync<Album>(dataSql, new
        {
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        }, transaction);

        return (items, totalCount);
    }
}
