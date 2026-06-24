namespace Rhythmix.Application.DTOs.Genre;

public sealed class GenreDto
{
    public Guid GenreId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
}
