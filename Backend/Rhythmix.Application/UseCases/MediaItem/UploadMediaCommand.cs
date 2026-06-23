
using MediatR;
using Rhythmix.Application.DTOs.Media;

namespace Rhythmix.Application.UseCases.Media;

public sealed class UploadMediaCommand : IRequest<MediaDto>
{
    public string Title { get; init; } = string.Empty;
    public string? ArtistName { get; init; }
    public string? Description { get; init; }
    public Guid? AlbumId { get; init; }
    public Guid? GenreId { get; init; }
    public IReadOnlyCollection<Guid> GenreIds { get; init; } = Array.Empty<Guid>();
    public bool IsPublic { get; init; } = true;
    public Guid OwnerId { get; init; }
    
    public Stream FileStream { get; init; } = null!;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long FileLength { get; init; }

    public Stream? CoverImageStream { get; init; }
    public string? CoverImageFileName { get; init; }
    public Stream? VideoFileStream { get; init; }
    public string? VideoFileName { get; init; }
    public string? VideoContentType { get; init; }
    public long? VideoFileLength { get; init; }
}
