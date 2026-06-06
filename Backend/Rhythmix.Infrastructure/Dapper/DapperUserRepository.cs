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
        const string sql = "SELECT COUNT(1) FROM [AspNetUsers] WHERE Email = @Email";
        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.ExecuteScalarAsync<int>(sql, new { Email = email }, transaction) > 0;
    }

    public async Task<User?> GetByEmailAsync(string email, IDbTransaction? transaction = null)
    {
        const string sql = @"SELECT u.Id,
       u.Email,
       u.UserName,
       up.FullName AS DisplayName,
       up.Bio,
       up.AvatarUrl,
       u.PasswordHash,
       u.CreatedAt
FROM [AspNetUsers] u
LEFT JOIN [UserProfiles] up ON u.Id = up.UserId
WHERE u.Email = @Email";
        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email }, transaction);
    }

    public async Task<User?> GetByIdAsync(Guid id, IDbTransaction? transaction = null)
    {
        const string sql = @"SELECT u.Id,
       u.Email,
       u.UserName,
       up.FullName AS DisplayName,
       up.Bio,
       up.AvatarUrl,
       u.PasswordHash,
       u.CreatedAt
FROM [AspNetUsers] u
LEFT JOIN [UserProfiles] up ON u.Id = up.UserId
WHERE u.Id = @Id";
        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id }, transaction);
    }

    public async Task<Guid> CreateAsync(User user, IDbTransaction? transaction = null)
    {
        const string insertUser = @"INSERT INTO [AspNetUsers] (Id, UserName, Email, PasswordHash, CreatedAt)
VALUES (@Id, @UserName, @Email, @PasswordHash, @CreatedAt)";
        const string insertProfile = @"INSERT INTO [UserProfiles] (UserId, FullName, AvatarUrl, Bio, CreatedAt)
VALUES (@Id, @DisplayName, @AvatarUrl, @Bio, @CreatedAt)";

        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var localTransaction = transaction ?? connection.BeginTransaction();

        try
        {
            await connection.ExecuteAsync(insertUser, user, localTransaction);
            await connection.ExecuteAsync(insertProfile, user, localTransaction);

            if (transaction is null)
            {
                localTransaction.Commit();
            }

            return user.Id;
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

    public async Task<IEnumerable<User>> GetAllAsync(IDbTransaction? transaction = null)
    {
        const string sql = @"SELECT u.Id,
       u.Email,
       u.UserName,
       up.FullName AS DisplayName,
       up.Bio,
       up.AvatarUrl,
       u.PasswordHash,
       u.CreatedAt
FROM [AspNetUsers] u
LEFT JOIN [UserProfiles] up ON u.Id = up.UserId";
        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        return await connection.QueryAsync<User>(sql, transaction: transaction);
    }

    public async Task UpdateAsync(User user, IDbTransaction? transaction = null)
    {
        const string updateUser = @"UPDATE [AspNetUsers]
SET UserName = @UserName
WHERE Id = @Id";
        const string updateProfile = @"UPDATE [UserProfiles]
SET FullName = @DisplayName,
    Bio = @Bio,
    AvatarUrl = @AvatarUrl
WHERE UserId = @Id";

        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var localTransaction = transaction ?? connection.BeginTransaction();
        try
        {
            await connection.ExecuteAsync(updateUser, user, localTransaction);
            await connection.ExecuteAsync(updateProfile, user, localTransaction);

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

    public async Task DeleteAsync(Guid id, IDbTransaction? transaction = null)
    {
        const string deleteProfile = "DELETE FROM [UserProfiles] WHERE UserId = @Id";
        const string deleteUser = "DELETE FROM [AspNetUsers] WHERE Id = @Id";

        await using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var localTransaction = transaction ?? connection.BeginTransaction();
        try
        {
            await connection.ExecuteAsync(deleteProfile, new { Id = id }, localTransaction);
            await connection.ExecuteAsync(deleteUser, new { Id = id }, localTransaction);

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
}
