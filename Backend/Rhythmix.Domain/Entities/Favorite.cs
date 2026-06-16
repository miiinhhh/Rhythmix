namespace Rhythmix.Domain.Entities;

public class Favorite
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    
    // ID của bài hát hoặc media được thích
    public Guid MediaId { get; set; } 
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}