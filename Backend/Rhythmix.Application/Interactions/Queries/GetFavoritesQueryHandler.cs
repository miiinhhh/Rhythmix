using Dapper;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Rhythmix.Application.Interactions.Queries;

public class GetFavoritesQueryHandler : IRequestHandler<GetFavoritesQuery, List<Guid>>
{
    private readonly IConfiguration _configuration;

    public GetFavoritesQueryHandler(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<List<Guid>> Handle(GetFavoritesQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
        {
            return new List<Guid>();
        }

        using var connection = new SqlConnection(
            _configuration.GetConnectionString("DefaultConnection")
        );

        var result = await connection.QueryAsync<Guid>(
            """
            SELECT MediaId
            FROM Favorites
            WHERE UserId = @UserId
            ORDER BY CreatedAt DESC
            """,
            new
            {
                UserId = Guid.Parse(request.UserId)
            }
        );

        return result.ToList();
    }
}