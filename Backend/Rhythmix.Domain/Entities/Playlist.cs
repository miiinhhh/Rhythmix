namespace Rhythmix.Domain.Entities;

public class Playlist
{
    public Guid Id { get; set; }
    public string Name {get;set;} = string.Empty; 
    public string Description {get;set;} = string.Empty;
    public bool IsPublic {get;set;} = false;
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}