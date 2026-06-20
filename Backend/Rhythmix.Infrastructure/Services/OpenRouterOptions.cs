namespace Rhythmix.Infrastructure.Services;

public sealed class OpenRouterOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "cohere/north-mini-code:free";
}
