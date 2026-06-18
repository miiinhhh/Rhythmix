using System.Data;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces;

public interface IGenreRepository
{
    Task<IEnumerable<Genre>> GetAllAsync(IDbTransaction? transaction = null);
}
