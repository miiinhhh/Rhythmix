<<<<<<< HEAD
namespace Rhythmix.Domain.Entities;

public class Favorite
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    
    // ID của bài hát hoặc media được thích
    public Guid MediaId { get; set; } 
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
=======
namespace Rhythmix.Domain.Entities;

public class Favorite
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    
    // ID của bài hát hoặc media được thích
    public Guid MediaId { get; set; } 
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
}