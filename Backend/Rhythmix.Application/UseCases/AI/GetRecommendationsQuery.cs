using MediatR;
using Rhythmix.Domain.Entities;
using System.Collections.Generic;

namespace Rhythmix.Application.UseCases.AI;

public record GetRecommendationsQuery(string UserId, int Limit = 10) : IRequest<RecommendationResult>;

public sealed record RecommendationResult(List<MediaItem> MediaItems, string Source, string? Reason = null);
