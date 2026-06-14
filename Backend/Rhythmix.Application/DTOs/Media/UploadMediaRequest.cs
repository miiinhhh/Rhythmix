

namespace Rhythmix.Application.DTOs.Media;

public class UploadMediaRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? AlbumId { get; set; }
    public bool IsPublic { get; set; } = true; 
}