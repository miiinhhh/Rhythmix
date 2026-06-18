using MediatR;
using Rhythmix.Application.DTOs.Genre;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Genre.Handlers;

public sealed class GetGenresQueryHandler : IRequestHandler<GetGenresQuery, IEnumerable<GenreDto>>
{
    private readonly IGenreRepository _genreRepository;

    public GetGenresQueryHandler(IGenreRepository genreRepository)
    {
        _genreRepository = genreRepository;
    }

    public async Task<IEnumerable<GenreDto>> Handle(GetGenresQuery request, CancellationToken cancellationToken)
    {
        var genres = await _genreRepository.GetAllAsync();
        return genres.Select(g => new GenreDto
        {
            GenreId = g.GenreId,
            Name = g.Name,
            Description = g.Description
        });
    }
}
