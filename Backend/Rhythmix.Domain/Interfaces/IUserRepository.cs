using System.Data;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, IDbTransaction? transaction = null);
    Task<User?> GetByIdAsync(Guid id, IDbTransaction? transaction = null);
    Task<bool> ExistsByEmailAsync(string email, IDbTransaction? transaction = null);
    Task<Guid> CreateAsync(User user, IDbTransaction? transaction = null);
    Task UpdateAsync(User user, IDbTransaction? transaction = null);
}
