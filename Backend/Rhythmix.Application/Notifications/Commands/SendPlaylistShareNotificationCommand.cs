using Dapper;
using MediatR;
using Rhythmix.Application.Common.Interfaces;
using System.Text.Json;

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
            var payload = JsonSerializer.Serialize(new
            {
                SenderName = request.SenderName,
                PlaylistName = request.PlaylistName
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
                Type = "PlaylistShare",
                Payload = payload,
                CreatedAt = createdAt
            });

            await _notificationHub.SendNotification(request.ReceiverUserId, new
            {
                Id = notificationId,
                UserId = request.ReceiverUserId,
                Type = "PlaylistShare",
                Payload = payload,
                Message = $"{request.SenderName} shared playlist \"{request.PlaylistName}\" with you",
                CreatedAt = createdAt
            });

            return Unit.Value;
        }
    }
}