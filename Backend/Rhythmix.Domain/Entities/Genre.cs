namespace Rhythmix.Domain.Entities;

public class Genre
{
    public Guid GenreId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}
