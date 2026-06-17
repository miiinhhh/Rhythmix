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
                ms.ShareId AS Id,
                ms.SenderId,
                COALESCE(senderProfile.FullName, sender.UserName) AS SenderName,
                ms.ReceiverId,
                COALESCE(receiverProfile.FullName, receiver.UserName) AS ReceiverName,
                ms.MediaId,
                media.Title AS MediaTitle,
                media.MediaType,
                ms.PlaylistId,
                playlist.Name AS PlaylistName,
                ms.Message,
                ms.SharedAt
            FROM [MediaShares] ms
            INNER JOIN [AspNetUsers] sender ON sender.Id = ms.SenderId
            LEFT JOIN [UserProfiles] senderProfile ON senderProfile.UserId = sender.Id
            INNER JOIN [AspNetUsers] receiver ON receiver.Id = ms.ReceiverId
            LEFT JOIN [UserProfiles] receiverProfile ON receiverProfile.UserId = receiver.Id
            LEFT JOIN [MediaItems] media ON media.MediaId = ms.MediaId
            LEFT JOIN [Playlists] playlist ON playlist.PlaylistId = ms.PlaylistId
            WHERE ms.ReceiverId = @UserId
            ORDER BY ms.SharedAt DESC";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<MediaShare>(sql, new { UserId = userId }, transaction);
    }

    public async Task<IEnumerable<MediaShare>> GetSharedByMeAsync(Guid userId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                ms.ShareId AS Id,
                ms.SenderId,
                COALESCE(senderProfile.FullName, sender.UserName) AS SenderName,
                ms.ReceiverId,
                COALESCE(receiverProfile.FullName, receiver.UserName) AS ReceiverName,
                ms.MediaId,
                media.Title AS MediaTitle,
                media.MediaType,
                ms.PlaylistId,
                playlist.Name AS PlaylistName,
                ms.Message,
                ms.SharedAt
            FROM [MediaShares] ms
            INNER JOIN [AspNetUsers] sender ON sender.Id = ms.SenderId
            LEFT JOIN [UserProfiles] senderProfile ON senderProfile.UserId = sender.Id
            INNER JOIN [AspNetUsers] receiver ON receiver.Id = ms.ReceiverId
            LEFT JOIN [UserProfiles] receiverProfile ON receiverProfile.UserId = receiver.Id
            LEFT JOIN [MediaItems] media ON media.MediaId = ms.MediaId
            LEFT JOIN [Playlists] playlist ON playlist.PlaylistId = ms.PlaylistId
            WHERE ms.SenderId = @UserId
            ORDER BY ms.SharedAt DESC";

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
                AND ((MediaId = @MediaId) OR (MediaId IS NULL AND @MediaId IS NULL))
                AND ((PlaylistId = @PlaylistId) OR (PlaylistId IS NULL AND @PlaylistId IS NULL))";

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
                ms.ShareId AS Id,
                ms.SenderId,
                COALESCE(senderProfile.FullName, sender.UserName) AS SenderName,
                ms.ReceiverId,
                COALESCE(receiverProfile.FullName, receiver.UserName) AS ReceiverName,
                ms.MediaId,
                media.Title AS MediaTitle,
                media.MediaType,
                ms.PlaylistId,
                playlist.Name AS PlaylistName,
                ms.Message,
                ms.SharedAt
            FROM [MediaShares] ms
            INNER JOIN [AspNetUsers] sender ON sender.Id = ms.SenderId
            LEFT JOIN [UserProfiles] senderProfile ON senderProfile.UserId = sender.Id
            INNER JOIN [AspNetUsers] receiver ON receiver.Id = ms.ReceiverId
            LEFT JOIN [UserProfiles] receiverProfile ON receiverProfile.UserId = receiver.Id
            LEFT JOIN [MediaItems] media ON media.MediaId = ms.MediaId
            LEFT JOIN [Playlists] playlist ON playlist.PlaylistId = ms.PlaylistId
            WHERE ms.ShareId = @ShareId";

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
