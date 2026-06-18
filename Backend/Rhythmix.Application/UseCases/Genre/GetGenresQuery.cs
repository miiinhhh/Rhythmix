using MediatR;
using Rhythmix.Application.DTOs.Genre;

namespace Rhythmix.Application.UseCases.Genre;

public sealed class GetGenresQuery : IRequest<IEnumerable<GenreDto>>
{
}
