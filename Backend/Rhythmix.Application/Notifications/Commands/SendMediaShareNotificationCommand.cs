using Dapper;
using MediatR;
using Rhythmix.Application.Common.Interfaces;
using System.Text.Json;

namespace Rhythmix.Application.Notifications.Commands
{
    public record SendMediaShareNotificationCommand(
        string ReceiverUserId,
        string SenderName,
        string MediaTitle
    ) : IRequest<Unit>;

    public class SendMediaShareNotificationCommandHandler
        : IRequestHandler<SendMediaShareNotificationCommand, Unit>
    {
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly INotificationHub _notificationHub;

        public SendMediaShareNotificationCommandHandler(
            IDbConnectionFactory connectionFactory,
            INotificationHub notificationHub)
        {
            _connectionFactory = connectionFactory;
            _notificationHub = notificationHub;
        }

        public async Task<Unit> Handle(
            SendMediaShareNotificationCommand request,
            CancellationToken cancellationToken)
        {
            // ✅ CHỈ GIỮ 1 TÊN THỐNG NHẤT
            var payload = JsonSerializer.Serialize(new
            {
                SenderName = request.SenderName,   // ← Chỉ dùng SenderName
                MediaTitle = request.MediaTitle    // ← Chỉ dùng MediaTitle
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
                Type = "MediaShare",
                Payload = payload,
                CreatedAt = createdAt
            });

            // ✅ Gửi SignalR cũng dùng cùng format
            await _notificationHub.SendNotification(request.ReceiverUserId, new
            {
                Id = notificationId,
                UserId = request.ReceiverUserId,
                Type = "MediaShare",
                Payload = payload,
                Message = $"{request.SenderName} shared \"{request.MediaTitle}\" with you",
                CreatedAt = createdAt
            });

            return Unit.Value;
        }
    }
}