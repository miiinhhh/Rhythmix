
using MediatR;
using Rhythmix.Application.DTOs.Media;

namespace Rhythmix.Application.UseCases.Media;

public sealed class UploadMediaCommand : IRequest<MediaDto>
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? AlbumId { get; init; }
    public Guid? GenreId { get; init; }
    public bool IsPublic { get; init; } = true;
    public Guid OwnerId { get; init; }
    
    public Stream FileStream { get; init; } = null!;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long FileLength { get; init; }

    public Stream? CoverImageStream { get; init; }
    public string? CoverImageFileName { get; init; }
}
