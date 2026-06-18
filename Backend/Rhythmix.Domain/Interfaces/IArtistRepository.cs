using System.Data;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces;

public interface IArtistRepository
{
    Task<Artist?> GetByNameAsync(string name, IDbTransaction? transaction = null);
    Task<Guid> AddAsync(Artist artist, IDbTransaction? transaction = null);
}
