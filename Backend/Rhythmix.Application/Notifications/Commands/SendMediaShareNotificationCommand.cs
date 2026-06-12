using Dapper;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Application.Notifications.Commands
{
    /// <summary>
    /// Gọi command này ngay sau khi share media thành công để tạo thông báo cho người nhận
    /// </summary>
    public record SendMediaShareNotificationCommand(
        string ReceiverUserId,  // người nhận thông báo
        string SenderName,      // tên người gửi
        string MediaTitle       // tên bài hát / video được share
    ) : IRequest;

    public class SendMediaShareNotificationCommandHandler : IRequestHandler<SendMediaShareNotificationCommand>
    {
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly INotificationHub _notificationHub;

        public SendMediaShareNotificationCommandHandler(
            IDbConnectionFactory connectionFactory,
            INotificationHub notificationHub)
        {
            _connectionFactory = connectionFactory;
            _notificationHub   = notificationHub;
        }

        public async Task Handle(SendMediaShareNotificationCommand request, CancellationToken cancellationToken)
        {
            var payload = $"{{\"SenderName\":\"{request.SenderName}\",\"MediaTitle\":\"{request.MediaTitle}\"}}";

            // 1. Lưu vào DB
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Notifications (NotificationId, UserId, Type, Payload, IsRead, CreatedAt)
                VALUES (@NotificationId, @UserId, @Type, @Payload, 0, @CreatedAt)";

            await connection.ExecuteAsync(sql, new
            {
                NotificationId = Guid.NewGuid(),
                UserId         = request.ReceiverUserId,
                Type           = "MediaShare",
                Payload        = payload,
                CreatedAt      = DateTime.UtcNow
            });

            // 2. Push real-time qua SignalR
            await _notificationHub.SendNotification(request.ReceiverUserId, new
            {
                Type      = "MediaShare",
                Message   = $"{request.SenderName} đã chia sẻ \"{request.MediaTitle}\" với bạn",
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}
