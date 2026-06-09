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
            
            [cite_start]// Kiểm tra tồn tại [cite: 214, 252]
            const string checkSql = "SELECT COUNT(1) FROM Favorites WHERE UserId = @UserId AND MediaItemId = @MediaItemId";
            var exists = await connection.ExecuteScalarAsync<bool>(checkSql, new { request.UserId, request.MediaItemId });

            if (exists)
            {
                [cite_start]// Nếu đã thích thì xóa đi (Unfavorite) 
                const string deleteSql = "DELETE FROM Favorites WHERE UserId = @UserId AND MediaItemId = @MediaItemId";
                await connection.ExecuteAsync(deleteSql, new { request.UserId, request.MediaItemId });
                return "Removed from Favorites";
            }
            else
            {
                [cite_start]// Thêm mới vào mục yêu thích 
                const string insertSql = "INSERT INTO Favorites (Id, UserId, MediaItemId, CreatedAt) VALUES (@Id, @UserId, @MediaItemId, @CreatedAt)";
                await connection.ExecuteAsync(insertSql, new { 
                    Id = Guid.NewGuid(), 
                    request.UserId, 
                    request.MediaItemId, 
                    CreatedAt = DateTime.UtcNow 
                });
                return "Added to Favorites";
            }
        }
    }
}
