
using System.Data;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces;

public interface IPlaylistRepository : IRepository<Playlist, Guid>
{   
    /// <summary>
    /// Lấy tất cả playlist của một người dùng
    /// </summary>
    Task<IEnumerable<Playlist>> GetByOwnerIdAsync(Guid ownerId, IDbTransaction? transaction = null);

    /// <summary>
    /// Cập nhật tính công khai của một playlist
    /// </summary>
    Task<bool> UpdateVisibilityAsync(Guid playlistId, bool isPublic, IDbTransaction? transaction = null);

    /// <summary>
    /// Cập nhật thông tin playlist (tên, mô tả)
    /// </summary>
    Task<bool> UpdateInfoAsync(Guid playlistId, string name, string? description, IDbTransaction? transaction = null);
    
    /// <summary>
    /// Xóa playlist (kèm theo xóa tất cả tracks)
    /// </summary>
    Task<bool> DeletePlaylistAsync(Guid playlistId, IDbTransaction? transaction = null);

}