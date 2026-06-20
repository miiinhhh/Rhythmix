using Dapper;
using MediatR;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rhythmix.Application.UseCases.AI;

public class GetRecommendationsHandler : IRequestHandler<GetRecommendationsQuery, RecommendationResult>
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IOpenRouterRecommendationService _openRouterRecommendationService;

    public GetRecommendationsHandler(
        IDbConnectionFactory connectionFactory,
        IOpenRouterRecommendationService openRouterRecommendationService)
    {
        _connectionFactory = connectionFactory;
        _openRouterRecommendationService = openRouterRecommendationService;
    }

    public async Task<RecommendationResult> Handle(GetRecommendationsQuery request, CancellationToken cancellationToken)
    {
        var limit = Math.Clamp(request.Limit, 1, 20);

        // 1. Lấy lịch sử nghe gần nhất
        var recentHistory = await GetRecentHistoryAsync(request.UserId, 20);

        // 2. Lấy danh sách yêu thích
        var favorites = await GetFavoritesAsync(request.UserId);
        var catalog = await GetPublicCatalogAsync();

        try
        {
        var recommendedSongs = await _openRouterRecommendationService.GetRecommendationsAsync(
            recentHistory, favorites, catalog, limit);

        // 4. Tra cứu trong CSDL
        var matches = await SearchMediaItemsAsync(recommendedSongs);
        return matches.Count > 0
            ? new RecommendationResult(matches, "openrouter")
            : new RecommendationResult(await GetDatabaseRecommendationsAsync(request.UserId, limit), "database", "openrouter_no_library_match");
        }
        catch (InvalidOperationException)
        {
            return new RecommendationResult(await GetDatabaseRecommendationsAsync(request.UserId, limit), "database", "openrouter_key_missing");
        }
        catch (HttpRequestException exception)
        {
            var reason = exception.StatusCode == System.Net.HttpStatusCode.TooManyRequests
                ? "openrouter_rate_limited"
                : "openrouter_request_failed";
            return new RecommendationResult(await GetDatabaseRecommendationsAsync(request.UserId, limit), "database", reason);
        }
        catch (System.Text.Json.JsonException)
        {
            return new RecommendationResult(await GetDatabaseRecommendationsAsync(request.UserId, limit), "database", "openrouter_invalid_response");
        }
    }

    private async Task<List<(string Title, string Artist)>> GetRecentHistoryAsync(string userId, int limit)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = @"
            SELECT TOP (@Limit) m.Title, COALESCE(m.Description, 'Unknown Artist') AS Artist
            FROM PlayHistories ph
            INNER JOIN MediaItems m ON ph.MediaId = m.MediaId
            WHERE ph.UserId = @UserId
            ORDER BY ph.PlayedAt DESC";

        var result = await connection.QueryAsync<(string Title, string Artist)>(sql, new { UserId = userId, Limit = limit });
        return result.ToList();
    }

    private async Task<List<(string Title, string Artist)>> GetFavoritesAsync(string userId)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = @"
            SELECT m.Title, COALESCE(m.Description, 'Unknown Artist') AS Artist
            FROM Favorites f
            INNER JOIN MediaItems m ON f.MediaId = m.MediaId
            WHERE f.UserId = @UserId
            ORDER BY f.CreatedAt DESC";

        var result = await connection.QueryAsync<(string Title, string Artist)>(sql, new { UserId = userId });
        return result.ToList();
    }

    private async Task<List<(string Title, string Artist)>> GetPublicCatalogAsync()
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = @"
            SELECT TOP (100) m.Title, COALESCE(a.Name, 'Unknown Artist') AS Artist
            FROM MediaItems m
            LEFT JOIN Artists a ON a.ArtistId = m.ArtistId
            WHERE m.IsPublic = 1
            ORDER BY m.ViewCount DESC, m.CreatedAt DESC";

        var result = await connection.QueryAsync<(string Title, string Artist)>(sql);
        return result.ToList();
    }

    private async Task<List<MediaItem>> SearchMediaItemsAsync(List<(string Title, string Artist)> songs)
    {
        if (!songs.Any())
            return new List<MediaItem>();

        using var connection = _connectionFactory.CreateConnection();

        // Build OR query for multiple songs
        var conditions = string.Join(" OR ",
            songs.Select((s, i) => $"(Title LIKE @Title{i} OR Description LIKE @Title{i})"));

        if (string.IsNullOrEmpty(conditions))
            return new List<MediaItem>();

        var sql = $@"
            SELECT TOP 10 MediaId, Title, Description, MediaType, Duration,
                   FilePath, ThumbnailUrl, MimeType, FileSize, AlbumId, GenreId,
                   OwnerId, IsPublic, ViewCount, CreatedAt
            FROM MediaItems
            WHERE {conditions}";

        var parameters = new DynamicParameters();
        for (int i = 0; i < songs.Count; i++)
        {
            parameters.Add($"Title{i}", $"%{songs[i].Title}%");
        }

        var result = await connection.QueryAsync<MediaItem>(sql, parameters);
        return result.ToList();
    }

    private async Task<List<MediaItem>> GetDatabaseRecommendationsAsync(string userId, int limit)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = @"
            WITH PreferredGenres AS
            (
                SELECT DISTINCT m.GenreId
                FROM PlayHistories ph
                INNER JOIN MediaItems m ON m.MediaId = ph.MediaId
                WHERE ph.UserId = @UserId AND m.GenreId IS NOT NULL

                UNION

                SELECT DISTINCT m.GenreId
                FROM Favorites f
                INNER JOIN MediaItems m ON m.MediaId = f.MediaId
                WHERE f.UserId = @UserId AND m.GenreId IS NOT NULL
            )
            SELECT TOP (@Limit) m.MediaId, m.Title, m.Description, m.MediaType, m.Duration,
                   m.FilePath, m.ThumbnailUrl, m.MimeType, m.FileSize, m.AlbumId, m.GenreId,
                   m.OwnerId, m.IsPublic, m.ViewCount, m.CreatedAt
            FROM MediaItems m
            WHERE m.IsPublic = 1
            ORDER BY
                CASE WHEN EXISTS (SELECT 1 FROM PreferredGenres pg WHERE pg.GenreId = m.GenreId) THEN 0 ELSE 1 END,
                m.ViewCount DESC,
                m.CreatedAt DESC";

        var result = await connection.QueryAsync<MediaItem>(sql, new { UserId = userId, Limit = limit });
        return result.ToList();
    }
}
