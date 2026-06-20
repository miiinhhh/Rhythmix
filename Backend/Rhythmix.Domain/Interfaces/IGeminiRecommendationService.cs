using System.Collections.Generic;
using System.Threading.Tasks;

namespace Rhythmix.Domain.Interfaces;

public interface IGeminiRecommendationService
{
    Task<List<(string Title, string Artist)>> GetRecommendationsAsync(
        List<(string Title, string Artist)> history,
        List<(string Title, string Artist)> favorites,
        int limit);
}
