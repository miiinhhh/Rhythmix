using MediatR;

namespace Rhythmix.Application.UseCases.Media;

public sealed class StreamMediaQuery : IRequest<StreamMediaResponse?>
{
    public Guid MediaId { get; init; }
    public string? Range { get; init; } 
    public string? Type { get; init; }
}

public sealed class StreamMediaResponse
{
    public Stream FileStream { get; set; } = null!;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public long StartPosition { get; set; }
    public long EndPosition { get; set; }
    public bool IsPartialContent { get; set; }
}