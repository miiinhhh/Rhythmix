using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces
{
    public interface INotificationRepository
    {
        // Lấy thông báo cụ thể theo ID (dùng để kiểm tra trước khi đánh dấu đã đọc)
        Task<Notification?> GetByIdAsync(Guid id);

        // Lấy toàn bộ danh sách thông báo của một User (sắp xếp theo thời gian mới nhất lên đầu)
        Task<List<Notification>> GetByUserIdAsync(Guid userId);

        // Lưu thông báo mới vào CSDL khi có sự kiện (Share media, Follow, Share playlist)
        Task AddAsync(Notification notification);

        // Cập nhật trạng thái thông báo (đổi trạng thái IsRead thành true)
        Task UpdateAsync(Notification notification);
    }
}
