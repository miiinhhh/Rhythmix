// Rhythmix.Domain/Interfaces/ISearchRepository.cs
using System.Data;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces;

public interface ISearchRepository
{
    /// <summary>
    /// Tìm kiếm bài hát theo tên, nghệ sĩ hoặc album
    /// </summary>
    Task<(IEnumerable<MediaItem> Items, int TotalCount)> SearchMediaAsync(
        string query, 
        int page = 1, 
        int pageSize = 10, 
        IDbTransaction? transaction = null);

    /// <summary>
    /// Tìm kiếm playlist theo tên hoặc tên chủ sở hữu
    /// </summary>
    Task<(IEnumerable<Playlist> Items, int TotalCount)> SearchPlaylistAsync(
        string query, 
        int page = 1, 
        int pageSize = 10, 
        IDbTransaction? transaction = null);

    /// <summary>
    /// Lấy tất cả các playlist công khai với phân trang
    /// </summary>
    Task<(IEnumerable<Playlist> Items, int TotalCount)> GetPublicPlaylistsAsync(
        int page = 1, 
        int pageSize = 10, 
        IDbTransaction? transaction = null);

    /// <summary>
    /// Lấy tất cả các bài hát công khai với phân trang
    /// </summary>
    Task<(IEnumerable<MediaItem> Items, int TotalCount)> GetPublicMediaAsync(
        int page = 1, 
        int pageSize = 10, 
        IDbTransaction? transaction = null);
}