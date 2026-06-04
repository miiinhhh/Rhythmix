using System.Data;
using Dapper;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Dapper;

public sealed class DapperUserRepository : IUserRepository
{
    private readonly string _connectionString;

    public DapperUserRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<bool> ExistsByEmailAsync(string email, IDbTransaction? transaction = null)
    {
        const string sql = "SELECT COUNT(1) FROM [Users] WHERE Email = @Email";
        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Email = email }, transaction);
        return count > 0;
    }

    public async Task<User?> GetByEmailAsync(string email, IDbTransaction? transaction = null)
    {
        const string sql = @"SELECT Id, Email, UserName, DisplayName, Bio, AvatarUrl, PasswordHash, CreatedAt
FROM [Users]
WHERE Email = @Email";
        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email }, transaction);
    }

    public async Task<User?> GetByIdAsync(Guid id, IDbTransaction? transaction = null)
    {
        const string sql = @"SELECT Id, Email, UserName, DisplayName, Bio, AvatarUrl, PasswordHash, CreatedAt
FROM [Users]
WHERE Id = @Id";
        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id }, transaction);
    }

    public async Task<Guid> CreateAsync(User user, IDbTransaction? transaction = null)
    {
        const string sql = @"INSERT INTO [Users] (Id, Email, UserName, DisplayName, Bio, AvatarUrl, PasswordHash, CreatedAt)
VALUES (@Id, @Email, @UserName, @DisplayName, @Bio, @AvatarUrl, @PasswordHash, @CreatedAt)";
        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, user, transaction);
        return user.Id;
    }

    public async Task UpdateAsync(User user, IDbTransaction? transaction = null)
    {
        const string sql = @"UPDATE [Users]
SET UserName = @UserName,
    DisplayName = @DisplayName,
    Bio = @Bio,
    AvatarUrl = @AvatarUrl
WHERE Id = @Id";
        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, user, transaction);
    }
}
