using Dapper;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Application.Interactions.Queries
{
    public record GetRecentPlayHistoryQuery(string UserId) : IRequest<List<PlayHistory>>;

    public class GetRecentPlayHistoryQueryHandler : IRequestHandler<GetRecentPlayHistoryQuery, List<PlayHistory>>
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public GetRecentPlayHistoryQueryHandler(IDbConnectionFactory connectionFactory) 
            => _connectionFactory = connectionFactory;

        public async Task<List<PlayHistory>> Handle(GetRecentPlayHistoryQuery request, CancellationToken cancellationToken)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT TOP 10 * FROM PlayHistory WHERE UserId = @UserId ORDER BY PlayedAt DESC";

            var result = await connection.QueryAsync<PlayHistory>(sql, new { UserId = request.UserId });
            return result.ToList();
        }
    }
}
