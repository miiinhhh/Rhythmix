// Rhythmix.Domain/Interfaces/IAlbumRepository.cs
using System.Data;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces;

public interface IAlbumRepository
{
    Task<Album?> GetByIdAsync(Guid albumId, IDbTransaction? transaction = null);
    Task<IEnumerable<Album>> GetByOwnerIdAsync(Guid ownerId, IDbTransaction? transaction = null);
    Task<IEnumerable<Album>> GetPublicAlbumsAsync(int page = 1, int pageSize = 20, IDbTransaction? transaction = null);
    Task<Guid> CreateAsync(Album album, IDbTransaction? transaction = null);
    Task UpdateAsync(Album album, IDbTransaction? transaction = null);
    Task DeleteAsync(Guid albumId, IDbTransaction? transaction = null);
    Task<bool> ExistsAsync(Guid albumId, IDbTransaction? transaction = null);
    Task<int> GetTrackCountAsync(Guid albumId, IDbTransaction? transaction = null);
}