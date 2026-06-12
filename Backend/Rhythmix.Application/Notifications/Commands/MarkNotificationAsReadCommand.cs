using Dapper;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Application.Notifications.Commands
{
    public record MarkNotificationAsReadCommand(Guid NotificationId, string UserId) : IRequest<bool>;

    public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, bool>
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public MarkNotificationAsReadCommandHandler(IDbConnectionFactory connectionFactory) 
            => _connectionFactory = connectionFactory;

        public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
        {
            using var connection = _connectionFactory.CreateConnection();
            // PK của bảng Notifications là NotificationId (không phải Id)
            const string sql = @"
                UPDATE Notifications 
                SET IsRead = 1 
                WHERE NotificationId = @NotificationId AND UserId = @UserId";

            var affectedRows = await connection.ExecuteAsync(sql, new { 
                NotificationId = request.NotificationId, 
                UserId = request.UserId 
            });

            return affectedRows > 0;
        }
    }
}
