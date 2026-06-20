using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Services;

public sealed class OpenRouterRecommendationService : IOpenRouterRecommendationService
{
    private readonly HttpClient _httpClient;
    private readonly OpenRouterOptions _options;

    public OpenRouterRecommendationService(HttpClient httpClient, OpenRouterOptions options)
    {
        _httpClient = httpClient;
        _options = options;
    }

    public async Task<List<(string Title, string Artist)>> GetRecommendationsAsync(
        List<(string Title, string Artist)> history,
        List<(string Title, string Artist)> favorites,
        List<(string Title, string Artist)> catalog,
        int limit)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException("OpenRouter API key is not configured.");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = JsonContent.Create(new
            {
                model = _options.Model,
                stream = false,
                messages = new[]
                {
                    new
                    {
                        role = "system",
                        content = "Return only valid JSON in the form {\"songs\":[{\"title\":\"...\",\"artist\":\"...\"}]}."
                    },
                    new { role = "user", content = BuildPrompt(history, favorites, catalog, limit) }
                }
            })
        };

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync();
        using var document = await JsonDocument.ParseAsync(stream);
        return ParseSongs(ExtractContent(document.RootElement));
    }

    private static string BuildPrompt(
        IEnumerable<(string Title, string Artist)> history,
        IEnumerable<(string Title, string Artist)> favorites,
        IEnumerable<(string Title, string Artist)> catalog,
        int limit)
    {
        var historyText = string.Join(", ", history.Select(song => $"{song.Title} by {song.Artist}"));
        var favoriteText = string.Join(", ", favorites.Select(song => $"{song.Title} by {song.Artist}"));
        var catalogText = string.Join(", ", catalog.Select(song => $"{song.Title} by {song.Artist}"));

        return $"Listening history: {(string.IsNullOrWhiteSpace(historyText) ? "None" : historyText)}. " +
               $"Favorites: {(string.IsNullOrWhiteSpace(favoriteText) ? "None" : favoriteText)}. " +
               $"Available library catalog: {(string.IsNullOrWhiteSpace(catalogText) ? "None" : catalogText)}. " +
               $"Suggest at most {limit} songs and select only exact title and artist pairs from the catalog.";
    }

    private static string ExtractContent(JsonElement response)
    {
        if (!response.TryGetProperty("choices", out var choices) || choices.GetArrayLength() == 0)
        {
            return string.Empty;
        }

        var choice = choices[0];
        return choice.TryGetProperty("message", out var message) &&
               message.TryGetProperty("content", out var content)
            ? content.GetString() ?? string.Empty
            : string.Empty;
    }

    private static List<(string Title, string Artist)> ParseSongs(string content)
    {
        var start = content.IndexOf('{');
        var end = content.LastIndexOf('}');
        if (start < 0 || end <= start) return [];

        try
        {
            using var document = JsonDocument.Parse(content[start..(end + 1)]);
            if (!document.RootElement.TryGetProperty("songs", out var songs)) return [];

            return songs.EnumerateArray()
                .Select(song => (
                    Title: song.GetProperty("title").GetString()?.Trim() ?? string.Empty,
                    Artist: song.GetProperty("artist").GetString()?.Trim() ?? string.Empty))
                .Where(song => !string.IsNullOrWhiteSpace(song.Title))
                .ToList();
        }
        catch (JsonException)
        {
            return [];
        }
    }
}
