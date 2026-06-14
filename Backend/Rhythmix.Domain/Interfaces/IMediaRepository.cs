using System.Data;
using Rhythmix.Domain.Entities;
public interface IMediaRepository
{
    Task<MediaItem?> GetByIdAsync(Guid mediaId, IDbTransaction? transaction = null);
    Task<IEnumerable<MediaItem>> GetByIdsAsync(IEnumerable<Guid> mediaIds, IDbTransaction? transaction = null);
    Task<Guid> AddAsync(MediaItem media, IDbTransaction? transaction = null);
    Task UpdateAsync(MediaItem media, IDbTransaction? transaction = null);
    Task DeleteAsync(Guid mediaId, IDbTransaction? transaction = null);
    Task<bool> ExistsAsync(Guid mediaId, IDbTransaction? transaction = null);
    Task<IEnumerable<MediaItem>> GetByOwnerIdAsync(Guid ownerId, int page = 1, int pageSize = 20, IDbTransaction? transaction = null);
    Task IncrementViewCountAsync(Guid mediaId, IDbTransaction? transaction = null);
}