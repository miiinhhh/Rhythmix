using Dapper;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Application.Interactions.Commands
{
    public record ToggleFavoriteCommand(string UserId, Guid MediaItemId) : IRequest<string>;

    public class ToggleFavoriteCommandHandler : IRequestHandler<ToggleFavoriteCommand, string>
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public ToggleFavoriteCommandHandler(IDbConnectionFactory connectionFactory) 
            => _connectionFactory = connectionFactory;

        public async Task<string> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
        {
            using var connection = _connectionFactory.CreateConnection();
            
            // Kiểm tra tồn tại — dùng đúng tên cột MediaId theo DB schema
            const string checkSql = "SELECT COUNT(1) FROM Favorites WHERE UserId = @UserId AND MediaId = @MediaId";
            var exists = await connection.ExecuteScalarAsync<bool>(checkSql, new { request.UserId, MediaId = request.MediaItemId });

            if (exists)
            {
                // Nếu đã thích thì xóa đi (Unfavorite)
                const string deleteSql = "DELETE FROM Favorites WHERE UserId = @UserId AND MediaId = @MediaId";
                await connection.ExecuteAsync(deleteSql, new { request.UserId, MediaId = request.MediaItemId });
                return "Removed from Favorites";
            }
            else
            {
                // Thêm mới vào mục yêu thích — PK là (UserId, MediaId), không có cột Id riêng
                const string insertSql = "INSERT INTO Favorites (UserId, MediaId, CreatedAt) VALUES (@UserId, @MediaId, @CreatedAt)";
                await connection.ExecuteAsync(insertSql, new { 
                    request.UserId, 
                    MediaId = request.MediaItemId, 
                    CreatedAt = DateTime.UtcNow 
                });
                return "Added to Favorites";
            }
        }
    }
}
