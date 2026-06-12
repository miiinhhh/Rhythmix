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

     
    public async Task AddTrackAsync(Guid playlistId, Guid mediaId, int sortOrder = 0, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO [PlayListTrack] (PlaylistId, MediaId, SortOrder, AddedAt)
            VALUES (@PlaylistId, @MediaId, @SortOrder, @AddedAt)";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new 
        { 
            PlaylistId = playlistId, 
            MediaId = mediaId, 
            SortOrder = sortOrder,
            AddedAt = DateTime.UtcNow
        }, transaction);
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
                SortOrder,
                AddedAt
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

     
    public async Task<PlaylistTrack> GetTrackDetailAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                plt.PlaylistId,
                plt.MediaId,
                plt.SortOrder,
                plt.AddedAt,
                m.Title,
                m.FilePath,
                m.ThumbnailUrl,
                m.Duration
            FROM [PlayListTrack] plt
            INNER JOIN [MediaItems] m ON plt.MediaId = m.MediaId
            WHERE plt.PlaylistId = @PlaylistId AND plt.MediaId = @MediaId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        var result = await connection.QueryAsync<PlaylistTrack, MediaItem, PlaylistTrack>(
            sql,
            (playlistTrack, media) =>
            {
                // Map Media information to PlaylistTrack if needed
                // Or return combined data
                return playlistTrack;
            },
            new { PlaylistId = playlistId, MediaId = mediaId },
            transaction,
            splitOn: "Title"
        );
        
        return result.FirstOrDefault() ?? throw new InvalidOperationException("Track not found");
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