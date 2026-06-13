using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Domain.Interfaces
{
    public interface IPlayHistoryRepository
    {
        // Ghi nhận một lượt nghe nhạc/xem video mới vào CSDL
        Task AddAsync(PlayHistory history);

        // Lấy danh sách lịch sử nghe nhạc gần đây của một User
        // Tham số 'limit' mặc định là 10 để phục vụ yêu cầu "lấy 10 bài hát gần nhất"
        Task<List<PlayHistory>> GetRecentHistoryAsync(Guid userId, int limit = 10);
    }
}
