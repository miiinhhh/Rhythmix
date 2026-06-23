
namespace Rhythmix.API.DTOs;

public class UploadMediaRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? ArtistName { get; set; }
    public string? Description { get; set; }
    public Guid? AlbumId { get; set; }
    public Guid? GenreId { get; set; }
    public List<Guid> GenreIds { get; set; } = new();
    public bool IsPublic { get; set; } = true;
    public IFormFile File { get; set; } = null!;
    public IFormFile? CoverImage { get; set; }
    public IFormFile? VideoFile { get; set; }
}
