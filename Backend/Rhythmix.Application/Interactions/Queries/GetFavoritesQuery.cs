using MediatR;

namespace Rhythmix.Application.Interactions.Queries;

public record GetFavoritesQuery(string UserId) : IRequest<List<Guid>>;