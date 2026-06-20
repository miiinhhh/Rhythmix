using System.Net.Http.Json;
using System.Text.Json;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Infrastructure.Services;

public sealed class GeminiRecommendationService : IGeminiRecommendationService
{
    private readonly HttpClient _httpClient;
    private readonly GeminiOptions _options;

    public GeminiRecommendationService(HttpClient httpClient, GeminiOptions options)
    {
        _httpClient = httpClient;
        _options = options;
    }

    public async Task<List<(string Title, string Artist)>> GetRecommendationsAsync(
        List<(string Title, string Artist)> history,
        List<(string Title, string Artist)> favorites,
        int limit)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException("Gemini API key is not configured.");
        }

        var endpoint = $"models/{Uri.EscapeDataString(_options.Model)}:generateContent?key={Uri.EscapeDataString(_options.ApiKey)}";
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[] { new { text = BuildPrompt(history, favorites, limit) } }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        songs = new
                        {
                            type = "ARRAY",
                            items = new
                            {
                                type = "OBJECT",
                                properties = new
                                {
                                    title = new { type = "STRING" },
                                    artist = new { type = "STRING" }
                                },
                                required = new[] { "title", "artist" }
                            }
                        }
                    },
                    required = new[] { "songs" }
                }
            }
        };

        using var response = await _httpClient.PostAsJsonAsync(endpoint, requestBody);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync();
        using var document = await JsonDocument.ParseAsync(stream);
        return ParseSongs(ExtractOutputText(document.RootElement));
    }

    private static string BuildPrompt(
        IEnumerable<(string Title, string Artist)> history,
        IEnumerable<(string Title, string Artist)> favorites,
        int limit)
    {
        var historyText = string.Join(", ", history.Select(song => $"{song.Title} by {song.Artist}"));
        var favoriteText = string.Join(", ", favorites.Select(song => $"{song.Title} by {song.Artist}"));

        return $"You recommend songs available in a user's music library. " +
               $"Listening history: {(string.IsNullOrWhiteSpace(historyText) ? "None" : historyText)}. " +
               $"Favorites: {(string.IsNullOrWhiteSpace(favoriteText) ? "None" : favoriteText)}. " +
               $"Suggest at most {limit} songs. Prefer titles and artists likely to exist in the library.";
    }

    private static string ExtractOutputText(JsonElement response)
    {
        if (!response.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
        {
            return string.Empty;
        }

        var candidate = candidates[0];
        if (!candidate.TryGetProperty("content", out var content) ||
            !content.TryGetProperty("parts", out var parts) ||
            parts.GetArrayLength() == 0)
        {
            return string.Empty;
        }

        return parts[0].TryGetProperty("text", out var text) ? text.GetString() ?? string.Empty : string.Empty;
    }

    private static List<(string Title, string Artist)> ParseSongs(string outputText)
    {
        if (string.IsNullOrWhiteSpace(outputText)) return [];

        try
        {
            using var document = JsonDocument.Parse(outputText);
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
