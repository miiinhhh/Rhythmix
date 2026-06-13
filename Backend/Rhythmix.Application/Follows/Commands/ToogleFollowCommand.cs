using Dapper;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Application.Follows.Commands
{
    public record ToggleFollowCommand(string FollowerId, Guid FollowingId) : IRequest<string>;

    public class ToggleFollowCommandHandler : IRequestHandler<ToggleFollowCommand, string>
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public ToggleFollowCommandHandler(IDbConnectionFactory connectionFactory)
            => _connectionFactory = connectionFactory;

        public async Task<string> Handle(ToggleFollowCommand request, CancellationToken cancellationToken)
        {
            using var connection = _connectionFactory.CreateConnection();

            const string checkSql = @"
                SELECT COUNT(1) FROM Follows 
                WHERE FollowerId = @FollowerId AND FollowingId = @FollowingId";
            var exists = await connection.ExecuteScalarAsync<bool>(checkSql, new
            {
                FollowerId  = request.FollowerId,
                FollowingId = request.FollowingId
            });

            if (exists)
            {
                const string deleteSql = @"
                    DELETE FROM Follows 
                    WHERE FollowerId = @FollowerId AND FollowingId = @FollowingId";
                await connection.ExecuteAsync(deleteSql, new
                {
                    FollowerId  = request.FollowerId,
                    FollowingId = request.FollowingId
                });
                return "Unfollowed";
            }
            else
            {
                const string insertSql = @"
                    INSERT INTO Follows (FollowerId, FollowingId, FollowedAt) 
                    VALUES (@FollowerId, @FollowingId, @FollowedAt)";
                await connection.ExecuteAsync(insertSql, new
                {
                    FollowerId  = request.FollowerId,
                    FollowingId = request.FollowingId,
                    FollowedAt  = DateTime.UtcNow
                });
                return "Followed";
            }
        }
    }
}
