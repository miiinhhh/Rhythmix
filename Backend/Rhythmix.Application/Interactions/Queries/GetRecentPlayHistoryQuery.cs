using Dapper;
using MediatR;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.Application.Interactions.Queries
{
    public record GetRecentPlayHistoryQuery(string UserId) : IRequest<List<RecentPlayHistoryDto>>;

    public sealed class RecentPlayHistoryDto
    {
        public Guid HistoryId { get; set; }
        public Guid MediaId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string MediaType { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public DateTime PlayedAt { get; set; }
    }

    public class GetRecentPlayHistoryQueryHandler
        : IRequestHandler<GetRecentPlayHistoryQuery, List<RecentPlayHistoryDto>>
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public GetRecentPlayHistoryQueryHandler(IDbConnectionFactory connectionFactory)
            => _connectionFactory = connectionFactory;

        public async Task<List<RecentPlayHistoryDto>> Handle(
            GetRecentPlayHistoryQuery request,
            CancellationToken cancellationToken)
        {
            using var connection = _connectionFactory.CreateConnection();

            const string sql = @"
                SELECT TOP 10
                    ph.HistoryId,
                    mi.MediaId,
                    mi.Title,
                    mi.MediaType,
                    mi.ThumbnailUrl,
                    mi.FilePath,
                    ph.PlayedAt
                FROM PlayHistories ph
                INNER JOIN MediaItems mi ON ph.MediaId = mi.MediaId
                WHERE ph.UserId = @UserId
                ORDER BY ph.PlayedAt DESC";

            var history = await connection.QueryAsync<RecentPlayHistoryDto>(
                sql,
                new { request.UserId });

            return history.ToList();
        }
    }
}
