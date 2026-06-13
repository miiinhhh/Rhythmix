using Dapper;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Application.Notifications.Queries
{
    public record GetNotificationsQuery(string UserId) : IRequest<List<Notification>>;

    public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, List<Notification>>
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public GetNotificationsQueryHandler(IDbConnectionFactory connectionFactory) 
            => _connectionFactory = connectionFactory;

        public async Task<List<Notification>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
        {
            using var connection = _connectionFactory.CreateConnection();
            // SELECT explicit để Dapper map đúng — DB có cột Payload, entity dùng Type/IsRead/CreatedAt/UserId
            const string sql = @"
                SELECT 
                    NotificationId  AS Id,
                    UserId,
                    Type,
                    Payload         AS Content,
                    IsRead,
                    CreatedAt
                FROM Notifications 
                WHERE UserId = @UserId 
                ORDER BY CreatedAt DESC";
            
            var result = await connection.QueryAsync<Notification>(sql, new { UserId = request.UserId });
            return result.ToList();
        }
    }
}
