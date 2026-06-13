using Dapper;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Application.Follows.Queries
{
    public record GetFollowStatusQuery(string FollowerId, Guid FollowingId) : IRequest<bool>;

    public class GetFollowStatusQueryHandler : IRequestHandler<GetFollowStatusQuery, bool>
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public GetFollowStatusQueryHandler(IDbConnectionFactory connectionFactory)
            => _connectionFactory = connectionFactory;

        public async Task<bool> Handle(GetFollowStatusQuery request, CancellationToken cancellationToken)
        {
            using var connection = _connectionFactory.CreateConnection();

            const string sql = @"
                SELECT COUNT(1) FROM Follows 
                WHERE FollowerId = @FollowerId AND FollowingId = @FollowingId";

            return await connection.ExecuteScalarAsync<bool>(sql, new
            {
                FollowerId  = request.FollowerId,
                FollowingId = request.FollowingId
            });
        }
    }
}
