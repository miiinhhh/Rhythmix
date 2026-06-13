namespace Rhythmix.Application.DTOs.Share;

public sealed class ShareItemDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public Guid ReceiverId { get; set; }
    public Guid? MediaId { get; set; }
    public string? MediaTitle { get; set; }
    public Guid? PlaylistId { get; set; }
    public string? PlaylistName { get; set; }
    public string? Message { get; set; }
    public DateTime SharedAt { get; set; }
}
