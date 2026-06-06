using System.Data;

namespace Rhythmix.Domain.Interfaces;

public interface IRepository<TEntity, TKey>
    where TEntity : class
{
    Task<TEntity?> GetByIdAsync(TKey id, IDbTransaction? transaction = null);
    Task<IEnumerable<TEntity>> GetAllAsync(IDbTransaction? transaction = null);
    Task<TKey> CreateAsync(TEntity entity, IDbTransaction? transaction = null);
    Task UpdateAsync(TEntity entity, IDbTransaction? transaction = null);
    Task DeleteAsync(TKey id, IDbTransaction? transaction = null);
}
