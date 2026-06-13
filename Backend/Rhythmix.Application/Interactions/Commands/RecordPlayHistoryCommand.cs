using Dapper;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Application.Interactions.Commands
{
    public record RecordPlayHistoryCommand(string UserId, Guid MediaItemId) : IRequest<bool>;

    public class RecordPlayHistoryCommandHandler : IRequestHandler<RecordPlayHistoryCommand, bool>
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public RecordPlayHistoryCommandHandler(IDbConnectionFactory connectionFactory) 
            => _connectionFactory = connectionFactory;

        public async Task<bool> Handle(RecordPlayHistoryCommand request, CancellationToken cancellationToken)
        {
            using var connection = _connectionFactory.CreateConnection();
            // Tên bảng đúng: PlayHistories (có chữ s); PK là HistoryId; cột media là MediaId
            const string sql = "INSERT INTO PlayHistories (HistoryId, UserId, MediaId, PlayedAt) VALUES (@HistoryId, @UserId, @MediaId, @PlayedAt)";

            var affectedRows = await connection.ExecuteAsync(sql, new {
                HistoryId = Guid.NewGuid(),
                request.UserId,
                MediaId = request.MediaItemId,
                PlayedAt = DateTime.UtcNow
            });

            return affectedRows > 0;
        }
    }
}
