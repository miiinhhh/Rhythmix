using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Dapper;

public sealed class DapperShareRepository : IShareRepository
{
    private readonly string _connectionString;

    public DapperShareRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<Guid> CreateShareAsync(MediaShare share, IDbTransaction? transaction = null)
    {
        const string sql = @"
        INSERT INTO [MediaShares] (ShareId, SenderId, ReceiverId, MediaId, PlaylistId, Message, SharedAt)
        VALUES (@Id, @SenderId, @ReceiverId, @MediaId, @PlaylistId, @Message, @SharedAt)";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new
        {
            Id = share.Id,
            share.SenderId,
            share.ReceiverId,
            share.MediaId,
            share.PlaylistId,
            share.Message,
            share.SharedAt
        }, transaction);

        return share.Id;
    }

    public async Task<IEnumerable<MediaShare>> GetSharedWithMeAsync(Guid userId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                ShareId AS Id,
                SenderId,
                ReceiverId,
                MediaId,
                PlaylistId,
                Message,
                SharedAt
            FROM [MediaShares]
            WHERE ReceiverId = @UserId
            ORDER BY SharedAt DESC";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<MediaShare>(sql, new { UserId = userId }, transaction);
    }

    public async Task<IEnumerable<MediaShare>> GetSharedByMeAsync(Guid userId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                ShareId AS Id,
                SenderId,
                ReceiverId,
                MediaId,
                PlaylistId,
                Message,
                SharedAt
            FROM [MediaShares]
            WHERE SenderId = @UserId
            ORDER BY SharedAt DESC";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<MediaShare>(sql, new { UserId = userId }, transaction);
    }

    public async Task<bool> ExistsDuplicateAsync(Guid senderId, Guid receiverId, Guid? mediaId, Guid? playlistId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT COUNT(1)
            FROM [MediaShares]
            WHERE SenderId = @SenderId 
                AND ReceiverId = @ReceiverId 
                AND MediaId = @MediaId 
                AND PlaylistId = @PlaylistId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        int count = await connection.ExecuteScalarAsync<int>(sql, new
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            MediaId = mediaId,
            PlaylistId = playlistId
        }, transaction);

        return count > 0;
    }

    public async Task<bool> ReceiverExistsAsync(Guid receiverId, IDbTransaction? transaction = null)
    {
        const string sql = "SELECT COUNT(1) FROM [AspNetUsers] WHERE Id = @ReceiverId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        int count = await connection.ExecuteScalarAsync<int>(sql, new { ReceiverId = receiverId }, transaction);

        return count > 0;
    }

    public async Task<MediaShare?> GetByIdAsync(Guid shareId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                ShareId AS Id,
                SenderId,
                ReceiverId,
                MediaId,
                PlaylistId,
                Message,
                SharedAt
            FROM [MediaShares]
            WHERE ShareId = @ShareId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QuerySingleOrDefaultAsync<MediaShare>(sql, new { ShareId = shareId }, transaction);
    }


    public async Task DeleteAsync(Guid shareId, IDbTransaction? transaction = null)
    {
        const string sql = "DELETE FROM [MediaShares] WHERE ShareId = @ShareId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new { ShareId = shareId }, transaction);
    }
}
