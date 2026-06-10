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
            const string sql = "INSERT INTO PlayHistory (Id, UserId, MediaItemId, PlayedAt) VALUES (@Id, @UserId, @MediaItemId, @PlayedAt)";

            var affectedRows = await connection.ExecuteAsync(sql, new {
                Id = Guid.NewGuid(),
                request.UserId,
                request.MediaItemId,
                PlayedAt = DateTime.UtcNow
            });

            return affectedRows > 0;
        }
    }
}
