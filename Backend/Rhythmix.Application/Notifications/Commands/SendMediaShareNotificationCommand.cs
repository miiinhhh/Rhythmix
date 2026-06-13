using Dapper;
using MediatR;
using Rhythmix.Application.Common.Interfaces;

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
            var payload = $"{{\"SenderName\":\"{request.SenderName}\",\"MediaTitle\":\"{request.MediaTitle}\"}}";

            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Notifications (NotificationId, UserId, Type, Payload, IsRead, CreatedAt)
                VALUES (@NotificationId, @UserId, @Type, @Payload, 0, @CreatedAt)";

            var createdAt = DateTime.UtcNow;
            await connection.ExecuteAsync(sql, new
            {
                NotificationId = Guid.NewGuid(),
                UserId = request.ReceiverUserId,
                Type = "MediaShare",
                Payload = payload,
                CreatedAt = createdAt
            });

            await _notificationHub.SendNotification(request.ReceiverUserId, new
            {
                Type = "MediaShare",
                Message = $"{request.SenderName} shared \"{request.MediaTitle}\" with you",
                CreatedAt = createdAt
            });

            return Unit.Value;
        }
    }
}
