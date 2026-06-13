using System.Data;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces;

public interface IPlaylistTrackRepository
{
    /// <summary>
    /// Thêm một track vào playlist
    /// </summary>
     Task<int> AddTrackAsync(Guid playlistId, Guid mediaId, int sortOrder = -1, IDbTransaction? transaction = null);

    /// <summary>
    /// Xóa một track khỏi playlist
    /// </summary>
    Task RemoveTrackAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null);

    /// <summary>
    /// Lấy tất cả các track trong một playlist
    /// </summary>
    Task<IEnumerable<PlaylistTrack>> GetTracksAsync(Guid playlistId, IDbTransaction? transaction = null);

    /// <summary>
    /// Kiểm tra xem một track có tồn tại trong playlist không
    /// </summary>
    Task<bool> ExistsAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null);

    /// <summary>
    /// Lấy chi tiết của một track cụ thể trong playlist (bao gồm thông tin từ MediaItems)
    /// </summary>
    Task<PlaylistTrack?> GetTrackDetailAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null);

    /// <summary>
    /// Cập nhật thứ tự sắp xếp của một track trong playlist
    /// </summary>
    Task UpdateSortOrderAsync(Guid playlistId, Guid mediaId, int sortOrder, IDbTransaction? transaction = null);

    /// <summary>
    /// Xóa tất cả các track khỏi một playlist (khi xóa playlist)
    /// </summary>
    Task RemoveAllTracksAsync(Guid playlistId, IDbTransaction? transaction = null);
}
