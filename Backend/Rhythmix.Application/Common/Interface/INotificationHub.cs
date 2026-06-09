using System.Threading.Tasks;

namespace TuneVault.Application.Common.Interfaces
{
    public interface INotificationHub
    {
        Task SendNotification(string userId, object notification);
    }
}
