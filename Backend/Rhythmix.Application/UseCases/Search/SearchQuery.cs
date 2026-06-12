using MediatR;
using Rhythmix.Application.DTOs.Search;

namespace Rhythmix.Application.UseCases.Search;

public sealed class SearchQuery : IRequest<SearchResponse>
{
    public string QueryText { get; init; } = string.Empty;
    public SearchType SearchType { get; init; } = SearchType.All;
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
    