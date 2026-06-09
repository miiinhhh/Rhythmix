using MediatR;
using Microsoft.EntityFrameworkCore;
using System vices;
using System;
using System.Threading;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace Rhythmix.Application.Notifications.Commands
{
    public record MarkNotificationAsReadCommand(Guid NotificationId, string UserId) : IRequest<bool>;

    public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, bool>
    {
        private readonly DbContext _context;

        public MarkNotificationAsReadCommandHandler(DbContext context) => _context = context;

        public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
        {
            var notification = await _context.Set<Notification>()
                .FirstOrDefaultAsync(n => n.Id == request.NotificationId && n.UserId == request.UserId, cancellationToken);

            if (notification == null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
