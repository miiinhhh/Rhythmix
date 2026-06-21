// src/utils/formatTime.ts
export const formatTime = (isoString: string): string => {
  try {
    
    let dateStr = isoString;
    
    if (dateStr.includes(' ') && !dateStr.includes('T') && !dateStr.includes('Z')) {
      dateStr = dateStr.replace(' ', 'T');
    }
    
    const date = new Date(dateStr);
    
    // Kiểm tra nếu date invalid
    if (isNaN(date.getTime())) {
      return 'Vừa xong';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Nếu thời gian trong tương lai (lỗi đồng hồ)
    if (diffMs < 0) {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    // Nếu là hôm nay
    if (diffDay === 0) {
      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      if (diffHour < 24) return `${diffHour} giờ trước`;
    }

    // Nếu trong tuần này
    if (diffDay < 7) {
      return `${diffDay} ngày trước`;
    }

    // Nếu trong năm nay
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }

    // Quá 1 năm
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  } catch {
    return 'Vừa xong';
  }
};