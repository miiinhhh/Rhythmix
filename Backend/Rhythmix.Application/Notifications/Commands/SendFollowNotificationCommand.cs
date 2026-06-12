using Dapper;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Application.Notifications.Commands
{
    /// <summary>
    /// Gọi command này ngay sau khi follow thành công để tạo thông báo cho người được follow
    /// </summary>
    public record SendFollowNotificationCommand(
        string ReceiverUserId,  // người được follow
        string FollowerName     // tên người vừa follow
    ) : IRequest;

    public class SendFollowNotificationCommandHandler : IRequestHandler<SendFollowNotificationCommand>
    {
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly INotificationHub _notificationHub;

        public SendFollowNotificationCommandHandler(
            IDbConnectionFactory connectionFactory,
            INotificationHub notificationHub)
        {
            _connectionFactory = connectionFactory;
            _notificationHub   = notificationHub;
        }

        public async Task Handle(SendFollowNotificationCommand request, CancellationToken cancellationToken)
        {
            var payload = $"{{\"FollowerName\":\"{request.FollowerName}\"}}";

            // 1. Lưu vào DB
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Notifications (NotificationId, UserId, Type, Payload, IsRead, CreatedAt)
                VALUES (@NotificationId, @UserId, @Type, @Payload, 0, @CreatedAt)";

            await connection.ExecuteAsync(sql, new
            {
                NotificationId = Guid.NewGuid(),
                UserId         = request.ReceiverUserId,
                Type           = "Follow",
                Payload        = payload,
                CreatedAt      = DateTime.UtcNow
            });

            // 2. Push real-time qua SignalR
            await _notificationHub.SendNotification(request.ReceiverUserId, new
            {
                Type      = "Follow",
                Message   = $"{request.FollowerName} đã bắt đầu theo dõi bạn",
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}
