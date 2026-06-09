using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Domain.Entities;

namespace Rhythmix.Application.Notifications.Queries
{
    public record GetNotificationsQuery(string UserId) : IRequest<List<Notification>>;

    public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, List<Notification>>
    {
        // Thay bằng DbContext của dự án bạn (ví dụ: ITuneVaultDbContext hoặc ApplicationDbContext)
        private readonly DbContext _context; 

        public GetNotificationsQueryHandler(DbContext context) => _context = context;

        public async Task<List<Notification>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
        {
            return await _context.Set<Notification>()
                .Where(n => n.UserId == request.UserId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync(cancellationToken);
        }
    }
}
