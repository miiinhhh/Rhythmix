using System.Threading.Tasks;

namespace Rhythmix.Application.Common.Interfaces
{
    public interface INotificationHub
    {
        Task SendNotification(string userId, object notification);
    }
}
