// Rhythmix.Application/UseCases/Album/Queries/GetAlbumByIdQuery.cs
using MediatR;
using Rhythmix.Application.DTOs.Album;

namespace Rhythmix.Application.UseCases.Album;

public sealed class GetAlbumByIdQuery : IRequest<AlbumDetailDto?>
{
    public Guid AlbumId { get; init; }
}

// Rhythmix.Application/UseCases/Album/Queries/GetMyAlbumsQuery.cs
public sealed class GetMyAlbumsQuery : IRequest<IEnumerable<AlbumDto>>
{
    public Guid UserId { get; init; }
}

// Rhythmix.Application/UseCases/Album/Commands/CreateAlbumCommand.cs
public sealed class CreateAlbumCommand : IRequest<AlbumDto>
{
    public Guid OwnerId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? CoverImageUrl { get; init; }
    public DateTime? ReleaseDate { get; init; }
}

// Rhythmix.Application/UseCases/Album/Commands/UpdateAlbumCommand.cs
public sealed class UpdateAlbumCommand : IRequest<AlbumDto?>
{
    public Guid AlbumId { get; init; }
    public Guid UserId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? CoverImageUrl { get; init; }
    public DateTime? ReleaseDate { get; init; }
}

// Rhythmix.Application/UseCases/Album/Commands/DeleteAlbumCommand.cs
public sealed class DeleteAlbumCommand : IRequest<bool>
{
    public Guid AlbumId { get; init; }
    public Guid UserId { get; init; }
}