using System.Data;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces;

public interface IUserRepository : IRepository<User, Guid>
{
    Task<User?> GetByEmailAsync(string email, IDbTransaction? transaction = null);
    Task<bool> ExistsByEmailAsync(string email, IDbTransaction? transaction = null);
}
