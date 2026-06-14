
namespace Rhythmix.API.DTOs;

public class UploadMediaRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? AlbumId { get; set; }
    public bool IsPublic { get; set; } = true;
    public IFormFile File { get; set; } = null!;
}