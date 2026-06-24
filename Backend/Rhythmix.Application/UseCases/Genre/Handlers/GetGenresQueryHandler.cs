using MediatR;
using Rhythmix.Application.DTOs.Genre;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Genre.Handlers;

public sealed class GetGenresQueryHandler : IRequestHandler<GetGenresQuery, IEnumerable<GenreDto>>
{
    private readonly IGenreRepository _genreRepository;
    private readonly ISearchRepository _searchRepository;

    public GetGenresQueryHandler(IGenreRepository genreRepository, ISearchRepository searchRepository)
    {
        _genreRepository = genreRepository;
        _searchRepository = searchRepository;
    }

    public async Task<IEnumerable<GenreDto>> Handle(GetGenresQuery request, CancellationToken cancellationToken)
    {
        var genres = await _genreRepository.GetAllAsync();
        var genrePlaylists = await _searchRepository.SearchGenrePlaylistsAsync("");
        
        // Chuyển thành dictionary để dễ tìm kiếm
        var genrePlaylistDict = genrePlaylists.ToDictionary(gp => gp.Genre.GenreId);
        
        var genreDtoList = new List<GenreDto>();
        
        foreach (var genre in genres)
        {
            string? coverImageUrl = null;
            
            // Kiểm tra xem genre có trong dictionary không
            if (genrePlaylistDict.TryGetValue(genre.GenreId, out var playlist))
            {
                // Lấy bài hát đầu tiên có thumbnail
                var firstTrackWithThumbnail = playlist.Tracks
                    .DistinctBy(t => t.MediaId) // loại trùng lặp bài hát
                    .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t.ThumbnailUrl));
                
                coverImageUrl = firstTrackWithThumbnail?.ThumbnailUrl;
            }
                
            genreDtoList.Add(new GenreDto
            {
                GenreId = genre.GenreId,
                Name = genre.Name,
                Description = genre.Description,
                CoverImageUrl = coverImageUrl
            });
        }
        
        return genreDtoList;
    }
}