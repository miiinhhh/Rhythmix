using System.Collections.Generic;
using System.Threading.Tasks;

namespace Rhythmix.Domain.Interfaces;

public interface IOpenRouterRecommendationService
{
    Task<List<(string Title, string Artist)>> GetRecommendationsAsync(
        List<(string Title, string Artist)> history,
        List<(string Title, string Artist)> favorites,
        List<(string Title, string Artist)> catalog,
        int limit);
}
