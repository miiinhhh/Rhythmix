using Microsoft.AspNetCore.SignalR;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Infrastructure.Hubs
{
    public class NotificationService : INotificationHub
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public Task SendNotification(string userId, object notification)
        {
            return _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notification);
        }
    }
}
