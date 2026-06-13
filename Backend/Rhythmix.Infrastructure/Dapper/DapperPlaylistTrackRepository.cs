using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Dapper;

/// <summary>
/// Repository implementation for PlaylistTrack using Dapper
/// Implements IPlaylistTrackRepository for managing tracks in playlists
/// </summary>
public sealed class DapperPlaylistTrackRepository : IPlaylistTrackRepository
{
    private readonly string _connectionString;

    public DapperPlaylistTrackRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    public async Task<int> AddTrackAsync(Guid playlistId, Guid mediaId, int sortOrder = -1, IDbTransaction? transaction = null)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        // Nếu sortOrder = -1 (không được cung cấp), tự động tính
        if (sortOrder < 0)
        {
            sortOrder = await GetNextSortOrderAsync(playlistId, connection, transaction);
        }

        const string sql = @"
        INSERT INTO [PlayListTrack] (PlaylistId, MediaId, SortOrder)
        VALUES (@PlaylistId, @MediaId, @SortOrder)";

        await connection.ExecuteAsync(sql, new
        {
            PlaylistId = playlistId,
            MediaId = mediaId,
            SortOrder = sortOrder
        }, transaction);

        return sortOrder;  
    }

    private async Task<int> GetNextSortOrderAsync(Guid playlistId, SqlConnection connection, IDbTransaction? transaction = null)
    {
        const string sql = @"
        SELECT ISNULL(MAX(SortOrder), -1) + 1
        FROM [PlayListTrack]
        WHERE PlaylistId = @PlaylistId";

        return await connection.ExecuteScalarAsync<int>(sql, new { PlaylistId = playlistId }, transaction);
    }


    public async Task RemoveTrackAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            DELETE FROM [PlayListTrack]
            WHERE PlaylistId = @PlaylistId AND MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new { PlaylistId = playlistId, MediaId = mediaId }, transaction);
    }


    public async Task<IEnumerable<PlaylistTrack>> GetTracksAsync(Guid playlistId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                PlaylistId,
                MediaId,
                SortOrder
            FROM [PlayListTrack]
            WHERE PlaylistId = @PlaylistId
            ORDER BY SortOrder ASC";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<PlaylistTrack>(sql, new { PlaylistId = playlistId }, transaction);
    }


    public async Task<bool> ExistsAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT COUNT(1)
            FROM [PlayListTrack]
            WHERE PlaylistId = @PlaylistId AND MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        int count = await connection.ExecuteScalarAsync<int>(sql, new { PlaylistId = playlistId, MediaId = mediaId }, transaction);
        return count > 0;
    }


    public async Task<PlaylistTrack?> GetTrackDetailAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null)
    {
        const string sql = @"
        SELECT 
            PlaylistId,
            MediaId,
            SortOrder
        FROM [PlayListTrack]
        WHERE PlaylistId = @PlaylistId AND MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        return await connection.QueryFirstOrDefaultAsync<PlaylistTrack>(
            sql,
            new { PlaylistId = playlistId, MediaId = mediaId },
            transaction);
    }

    /// <summary>
    /// Cập nhật thứ tự sắp xếp của một track trong playlist
    /// </summary>
    public async Task UpdateSortOrderAsync(Guid playlistId, Guid mediaId, int sortOrder, IDbTransaction? transaction = null)
    {
        const string sql = @"
            UPDATE [PlayListTrack]
            SET SortOrder = @SortOrder
            WHERE PlaylistId = @PlaylistId AND MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new
        {
            PlaylistId = playlistId,
            MediaId = mediaId,
            SortOrder = sortOrder
        }, transaction);
    }

    /// <summary>
    /// Xóa tất cả các track khỏi một playlist (khi xóa playlist)
    /// </summary>
    public async Task RemoveAllTracksAsync(Guid playlistId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            DELETE FROM [PlayListTrack]
            WHERE PlaylistId = @PlaylistId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new { PlaylistId = playlistId }, transaction);
    }

}