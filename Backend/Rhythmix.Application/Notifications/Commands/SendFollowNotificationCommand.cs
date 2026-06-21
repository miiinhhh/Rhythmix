using Dapper;
using MediatR;
using Rhythmix.Application.Common.Interfaces;
using System.Text.Json;

namespace Rhythmix.Application.Notifications.Commands
{
    public record SendFollowNotificationCommand(
        string ReceiverUserId,
        string FollowerId,
        string FollowerName
    ) : IRequest<Unit>;

    public class SendFollowNotificationCommandHandler
        : IRequestHandler<SendFollowNotificationCommand, Unit>
    {
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly INotificationHub _notificationHub;

        public SendFollowNotificationCommandHandler(
            IDbConnectionFactory connectionFactory,
            INotificationHub notificationHub)
        {
            _connectionFactory = connectionFactory;
            _notificationHub = notificationHub;
        }

        public async Task<Unit> Handle(
            SendFollowNotificationCommand request,
            CancellationToken cancellationToken)
        {
            var payload = JsonSerializer.Serialize(new
            {
                SenderId = request.FollowerId,
                SenderName = request.FollowerName,
                FollowerId = request.FollowerId,
                FollowerName = request.FollowerName
            });

            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Notifications (NotificationId, UserId, Type, Payload, IsRead, CreatedAt)
                VALUES (@NotificationId, @UserId, @Type, @Payload, 0, @CreatedAt)";

            var createdAt = DateTime.UtcNow;
            var notificationId = Guid.NewGuid();

            await connection.ExecuteAsync(sql, new
            {
                NotificationId = notificationId,
                UserId = request.ReceiverUserId,
                Type = "Follow",
                Payload = payload,
                CreatedAt = createdAt
            });

            await _notificationHub.SendNotification(request.ReceiverUserId, new
            {
                Id = notificationId,
                UserId = request.ReceiverUserId,
                Type = "Follow",
                Payload = payload,
                Message = $"{request.FollowerName} started following you",
                CreatedAt = createdAt
            });

            return Unit.Value;
        }
    }
}
