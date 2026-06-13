using System.Data;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces;

public interface IShareRepository
{
    /// <summary>
    /// Create a share (track or playlist)
    /// </summary>
    Task<Guid> CreateShareAsync(MediaShare share, IDbTransaction? transaction = null);

    /// <summary>
    /// Get all shared items for a user (inbox)
    /// </summary>
    Task<IEnumerable<MediaShare>> GetSharedWithMeAsync(Guid userId, IDbTransaction? transaction = null);

    /// <summary>
    /// Get all items shared by a user (outbox)
    /// </summary>
    Task<IEnumerable<MediaShare>> GetSharedByMeAsync(Guid userId, IDbTransaction? transaction = null);

    /// <summary>
    /// Check if a share already exists (avoid duplicates)
    /// </summary>
    Task<bool> ExistsDuplicateAsync(Guid senderId, Guid receiverId, Guid? mediaId, Guid? playlistId, IDbTransaction? transaction = null);

    /// <summary>
    /// Check if receiver exists in system
    /// </summary>
    Task<bool> ReceiverExistsAsync(Guid receiverId, IDbTransaction? transaction = null);

    /// <summary>
    /// Get share by ID
    /// </summary>
    Task<MediaShare?> GetByIdAsync(Guid shareId, IDbTransaction? transaction = null);

    /// <summary>
    /// Delete a share
    /// </summary>
    Task DeleteAsync(Guid shareId, IDbTransaction? transaction = null);
}
