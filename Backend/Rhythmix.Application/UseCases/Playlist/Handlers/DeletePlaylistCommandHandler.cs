using Dapper;
using MediatR;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Playlist.Handlers;

public sealed class DeletePlaylistCommandHandler : IRequestHandler<DeletePlaylistCommand, bool>
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly INotificationHub _notificationHub;

    public DeletePlaylistCommandHandler(
        IPlaylistRepository playlistRepository,
        IDbConnectionFactory connectionFactory,
        INotificationHub notificationHub)
    {
        _playlistRepository = playlistRepository;
        _connectionFactory = connectionFactory;
        _notificationHub = notificationHub;
    }

    public async Task<bool> Handle(DeletePlaylistCommand request, CancellationToken cancellationToken)
    {
        // Check if playlist exists and belongs to the user
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        if (playlist == null || playlist.OwnerId != request.UserId)
        {
            throw new InvalidOperationException("Playlist not found or you do not have permission to delete it.");
        }

        // Delete the playlist
        await _playlistRepository.DeleteAsync(request.PlaylistId);

        var createdAt = DateTime.UtcNow;

        // Create + push notification
        // Receiver: the user who deletes playlist (request.UserId)
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            INSERT INTO Notifications (NotificationId, UserId, Type, Payload, IsRead, CreatedAt)
            VALUES (@NotificationId, @UserId, @Type, @Payload, 0, @CreatedAt)";

        await connection.ExecuteAsync(sql, new
        {
            NotificationId = Guid.NewGuid(),
            UserId = request.UserId,
            Type = "PlaylistDeleted",
            Payload = $"{{\"PlaylistId\":\"{request.PlaylistId}\"}}",
            CreatedAt = createdAt
        });

        await _notificationHub.SendNotification(request.UserId.ToString(), new
        {
            Type = "PlaylistDeleted",
            Message = "Your playlist has been deleted",
            CreatedAt = createdAt
        });

        return true;
    }
}
