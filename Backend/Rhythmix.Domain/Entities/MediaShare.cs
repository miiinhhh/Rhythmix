namespace Rhythmix.Domain.Entities;

public class MediaShare
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public Guid? MediaId { get; set; }
    public Guid? PlaylistId { get; set; }
    public string? Message { get; set; }
    public DateTime SharedAt { get; set; } = DateTime.UtcNow;
}
