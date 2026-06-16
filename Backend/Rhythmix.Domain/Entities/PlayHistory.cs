namespace Rhythmix.Domain.Entities;

public class PlayHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    
    // ID của bài hát hoặc media đã nghe
    public Guid MediaId { get; set; } 
    
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}