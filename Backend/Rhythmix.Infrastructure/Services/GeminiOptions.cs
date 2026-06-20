namespace Rhythmix.Infrastructure.Services;

public sealed class GeminiOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gemini-2.0-flash";
}
