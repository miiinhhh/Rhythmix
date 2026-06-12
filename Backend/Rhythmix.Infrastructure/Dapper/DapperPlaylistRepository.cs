using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Dapper;

/// <summary>
/// Repository implementation for Playlist using Dapper
/// Implements IPlaylistRepository with direct SQL queries
/// </summary>
public sealed class DapperPlaylistRepository : IPlaylistRepository
{
    private readonly string _connectionString;

    public DapperPlaylistRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

     
    public async Task<Playlist?> GetByIdAsync(Guid id, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                PlaylistId AS Id,
                Name,
                Description,
                IsPublic,
                OwnerId,
                CreatedAt
            FROM [Playlists]
            WHERE PlaylistId = @Id";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QuerySingleOrDefaultAsync<Playlist>(sql, new { Id = id }, transaction);
    }

     
    public async Task<IEnumerable<Playlist>> GetAllAsync(IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                PlaylistId AS Id,
                Name,
                Description,
                IsPublic,
                OwnerId,
                CreatedAt
            FROM [Playlists]
            ORDER BY CreatedAt DESC";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<Playlist>(sql, transaction: transaction);
    }

     
    public async Task<Guid> CreateAsync(Playlist entity, IDbTransaction? transaction = null)
    {
        if (entity == null) throw new ArgumentNullException(nameof(entity));

        const string sql = @"
            INSERT INTO [Playlists] (PlaylistId, Name, Description, IsPublic, OwnerId, CreatedAt)
            VALUES (@Id, @Name, @Description, @IsPublic, @OwnerId, @CreatedAt)";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new
        {
            Id = entity.Id,
            entity.Name,
            entity.Description,
            entity.IsPublic,
            entity.OwnerId,
            entity.CreatedAt
        }, transaction);

        return entity.Id;
    }

     
    public async Task UpdateAsync(Playlist entity, IDbTransaction? transaction = null)
    {
        if (entity == null) throw new ArgumentNullException(nameof(entity));

        const string sql = @"
            UPDATE [Playlists]
            SET Name = @Name,
                Description = @Description,
                IsPublic = @IsPublic
            WHERE PlaylistId = @Id";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, new
        {
            entity.Name,
            entity.Description,
            entity.IsPublic,
            Id = entity.Id
        }, transaction);
    }

     
    public async Task DeleteAsync(Guid id, IDbTransaction? transaction = null)
    {
        // Delete tracks associated with playlist first
        const string deleteTracksSQL = @"DELETE FROM [PlayListTrack] WHERE PlaylistId = @PlaylistId";
        
        // Then delete playlist
        const string deletePlaylistSQL = @"DELETE FROM [Playlists] WHERE PlaylistId = @PlaylistId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var localTransaction = transaction ?? connection.BeginTransaction();

        try
        {
            await connection.ExecuteAsync(deleteTracksSQL, new { PlaylistId = id }, localTransaction);
            await connection.ExecuteAsync(deletePlaylistSQL, new { PlaylistId = id }, localTransaction);

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

     
    public async Task<IEnumerable<Playlist>> GetByOwnerIdAsync(Guid ownerId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT 
                PlaylistId AS Id,
                Name,
                Description,
                IsPublic,
                OwnerId,
                CreatedAt
            FROM [Playlists]
            WHERE OwnerId = @OwnerId
            ORDER BY CreatedAt DESC";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<Playlist>(sql, new { OwnerId = ownerId }, transaction);
    }

     
    public async Task<bool> UpdateVisibilityAsync(Guid playlistId, bool isPublic, IDbTransaction? transaction = null)
    {
        const string sql = @"
            UPDATE [Playlists]
            SET IsPublic = @IsPublic
            WHERE PlaylistId = @PlaylistId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        int rowsAffected = await connection.ExecuteAsync(sql, 
            new { PlaylistId = playlistId, IsPublic = isPublic }, 
            transaction);
        return rowsAffected > 0;
    }

     
    public async Task<bool> UpdateInfoAsync(Guid playlistId, string name, string? description, IDbTransaction? transaction = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Playlist name cannot be empty", nameof(name));

        const string sql = @"
            UPDATE [Playlists]
            SET Name = @Name,
                Description = @Description
            WHERE PlaylistId = @PlaylistId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        int rowsAffected = await connection.ExecuteAsync(sql, new
        {
            PlaylistId = playlistId,
            Name = name.Trim(),
            Description = description?.Trim()
        }, transaction);

        return rowsAffected > 0;
    }

//
    //
    public async Task<bool> DeletePlaylistAsync(Guid playlistId, IDbTransaction? transaction = null)
    {
        // Delete tracks associated with playlist first
        const string deleteTracksSQL = @"DELETE FROM [PlayListTrack] WHERE PlaylistId = @PlaylistId";
        
        // Then delete playlist
        const string deletePlaylistSQL = @"DELETE FROM [Playlists] WHERE PlaylistId = @PlaylistId";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var localTransaction = transaction ?? connection.BeginTransaction();

        try
        {
            // Delete all tracks in the playlist
            await connection.ExecuteAsync(deleteTracksSQL, new { PlaylistId = playlistId }, localTransaction);
            
            // Delete the playlist
            int rowsAffected = await connection.ExecuteAsync(deletePlaylistSQL, new { PlaylistId = playlistId }, localTransaction);

            if (transaction is null)
            {
                localTransaction.Commit();
            }

            return rowsAffected > 0;
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
}