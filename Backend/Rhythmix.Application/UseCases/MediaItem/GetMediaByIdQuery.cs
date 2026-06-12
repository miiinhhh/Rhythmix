
using MediatR;
using Rhythmix.Application.DTOs.Media;

namespace Rhythmix.Application.UseCases.Media;

public sealed class GetMediaByIdQuery : IRequest<MediaDto?>
{
    public Guid MediaId { get; init; }
}