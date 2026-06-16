namespace Rhythmix.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // ID của người nhận thông báo
    public string UserId { get; set; } = string.Empty; 
    
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    
    // Loại thông báo: "MediaShare", "Follow", "PlaylistShare" để frontend xử lý UI
    public string Type { get; set; } = string.Empty; 
    
    // Trạng thái đọc thông báo
    public bool IsRead { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}