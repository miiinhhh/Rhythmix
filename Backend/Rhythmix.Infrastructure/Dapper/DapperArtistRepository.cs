using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Dapper;

public sealed class DapperArtistRepository : IArtistRepository
{
    private readonly string _connectionString;

    public DapperArtistRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    public async Task<Artist?> GetByNameAsync(string name, IDbTransaction? transaction = null)
    {
        const string sql = @"
            SELECT ArtistId, Name, Description, AvatarUrl, CoverImageUrl, CreatedAt
            FROM [Artists]
            WHERE LOWER(Name) = LOWER(@Name)";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryFirstOrDefaultAsync<Artist>(sql, new { Name = name.Trim() }, transaction);
    }

    public async Task<Guid> AddAsync(Artist artist, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO [Artists] (ArtistId, Name, Description, AvatarUrl, CoverImageUrl, CreatedAt)
            VALUES (@ArtistId, @Name, @Description, @AvatarUrl, @CoverImageUrl, @CreatedAt)";

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, artist, transaction);
        return artist.ArtistId;
    }
}
