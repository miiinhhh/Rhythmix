namespace Rhythmix.Application.DTOs.Search; 
public sealed class SearchRequest { 
    public string Query { get; set; } = string.Empty; 
    public SearchType Type { get; set; } = SearchType.All; 
    public int Page { get; set; } = 1; 
    public int PageSize { get; set; } = 10; } 
    public enum SearchType { 
        All = 0, 
        Media = 1, 
        Playlist = 2, 
        User = 3 
    }