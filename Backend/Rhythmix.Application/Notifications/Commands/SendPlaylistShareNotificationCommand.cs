using Dapper;
using MediatR;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Application.Notifications.Commands
{
    public record SendPlaylistShareNotificationCommand(
        string ReceiverUserId,
        string SenderName,
        string PlaylistName
    ) : IRequest<Unit>;

    public class SendPlaylistShareNotificationCommandHandler
        : IRequestHandler<SendPlaylistShareNotificationCommand, Unit>
    {
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly INotificationHub _notificationHub;

        public SendPlaylistShareNotificationCommandHandler(
            IDbConnectionFactory connectionFactory,
            INotificationHub notificationHub)
        {
            _connectionFactory = connectionFactory;
            _notificationHub = notificationHub;
        }

        public async Task<Unit> Handle(
            SendPlaylistShareNotificationCommand request,
            CancellationToken cancellationToken)
        {
            var payload = $"{{\"SenderName\":\"{request.SenderName}\",\"PlaylistName\":\"{request.PlaylistName}\"}}";

            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Notifications (NotificationId, UserId, Type, Payload, IsRead, CreatedAt)
                VALUES (@NotificationId, @UserId, @Type, @Payload, 0, @CreatedAt)";

            var createdAt = DateTime.UtcNow;
            await connection.ExecuteAsync(sql, new
            {
                NotificationId = Guid.NewGuid(),
                UserId = request.ReceiverUserId,
                Type = "PlaylistShare",
                Payload = payload,
                CreatedAt = createdAt
            });

            await _notificationHub.SendNotification(request.ReceiverUserId, new
            {
                Type = "PlaylistShare",
                Message = $"{request.SenderName} shared playlist \"{request.PlaylistName}\" with you",
                CreatedAt = createdAt
            });

            return Unit.Value;
        }
    }
}
