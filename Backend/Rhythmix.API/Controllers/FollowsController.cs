using System.Security.Claims;
using Dapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Application.Common.Models;
using Rhythmix.Application.Follows.Commands;
using Rhythmix.Application.Follows.Queries;

namespace Rhythmix.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FollowsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IDbConnectionFactory _connectionFactory;

        public FollowsController(IMediator mediator, IDbConnectionFactory connectionFactory)
        {
            _mediator = mediator;
            _connectionFactory = connectionFactory;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;

        [HttpPost("{followingId}")]
        public async Task<IActionResult> ToggleFollow(Guid followingId)
            => await ToggleUserFollow(followingId);

        [HttpPost("users/{followingId}")]
        public async Task<IActionResult> ToggleUserFollow(Guid followingId)
        {
            if (CurrentUserId == followingId.ToString())
            {
                return BadRequest(ApiResponse<object>.ToFailure("Cannot follow yourself."));
            }

            var message = await _mediator.Send(new ToggleFollowCommand(CurrentUserId, followingId));
            return Ok(ApiResponse<object>.ToSuccess(new
            {
                Message = message,
                IsFollowing = string.Equals(message, "Followed", StringComparison.OrdinalIgnoreCase)
            }));
        }

        [HttpGet("{followingId}/status")]
        public async Task<IActionResult> GetFollowStatus(Guid followingId)
            => await GetUserFollowStatus(followingId);

        [HttpGet("users/{followingId}/status")]
        public async Task<IActionResult> GetUserFollowStatus(Guid followingId)
        {
            var isFollowing = await _mediator.Send(new GetFollowStatusQuery(CurrentUserId, followingId));
            return Ok(ApiResponse<object>.ToSuccess(new { IsFollowing = isFollowing }));
        }

        [HttpGet("users/{userId}/followers")]
        public async Task<IActionResult> GetUserFollowers(Guid userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT u.Id, u.UserName, u.Email, p.FullName AS DisplayName, p.Bio, p.AvatarUrl, u.CreatedAt
                FROM Follows f
                INNER JOIN AspNetUsers u ON u.Id = f.FollowerId
                LEFT JOIN UserProfiles p ON p.UserId = u.Id
                WHERE f.FollowingId = @UserId
                ORDER BY f.FollowedAt DESC";

            var users = await connection.QueryAsync<FollowUserItem>(sql, new { UserId = userId });
            return Ok(ApiResponse<object>.ToSuccess(users));
        }

        [HttpGet("users/{userId}/following")]
        public async Task<IActionResult> GetUserFollowing(Guid userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT u.Id, u.UserName, u.Email, p.FullName AS DisplayName, p.Bio, p.AvatarUrl, u.CreatedAt
                FROM Follows f
                INNER JOIN AspNetUsers u ON u.Id = f.FollowingId
                LEFT JOIN UserProfiles p ON p.UserId = u.Id
                WHERE f.FollowerId = @UserId
                ORDER BY f.FollowedAt DESC";

            var users = await connection.QueryAsync<FollowUserItem>(sql, new { UserId = userId });
            return Ok(ApiResponse<object>.ToSuccess(users));
        }

        [HttpGet("users/{userId}/counts")]
        public async Task<IActionResult> GetUserFollowCounts(Guid userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT
                    (SELECT COUNT(1) FROM Follows WHERE FollowingId = @UserId) AS FollowersCount,
                    (SELECT COUNT(1) FROM Follows WHERE FollowerId = @UserId) AS FollowingCount";

            var counts = await connection.QuerySingleAsync<FollowCounts>(sql, new { UserId = userId });
            return Ok(ApiResponse<object>.ToSuccess(counts));
        }

        [HttpPost("artists/{artistId}")]
        public async Task<IActionResult> ToggleArtistFollow(Guid artistId)
        {
            if (!Guid.TryParse(CurrentUserId, out var userId))
            {
                return Unauthorized(ApiResponse<object>.ToFailure("Invalid token."));
            }

            using var connection = _connectionFactory.CreateConnection();
            var artistExists = await connection.ExecuteScalarAsync<bool>(
                "SELECT COUNT(1) FROM Artists WHERE ArtistId = @ArtistId",
                new { ArtistId = artistId });

            if (!artistExists)
            {
                return NotFound(ApiResponse<object>.ToFailure("Artist not found."));
            }

            var exists = await connection.ExecuteScalarAsync<bool>(
                "SELECT COUNT(1) FROM ArtistFollows WHERE UserId = @UserId AND ArtistId = @ArtistId",
                new { UserId = userId, ArtistId = artistId });

            if (exists)
            {
                await connection.ExecuteAsync(
                    "DELETE FROM ArtistFollows WHERE UserId = @UserId AND ArtistId = @ArtistId",
                    new { UserId = userId, ArtistId = artistId });

                return Ok(ApiResponse<object>.ToSuccess(new { Message = "Unfollowed", IsFollowing = false }));
            }

            await connection.ExecuteAsync(
                "INSERT INTO ArtistFollows (UserId, ArtistId, FollowedAt) VALUES (@UserId, @ArtistId, @FollowedAt)",
                new { UserId = userId, ArtistId = artistId, FollowedAt = DateTime.UtcNow });

            return Ok(ApiResponse<object>.ToSuccess(new { Message = "Followed", IsFollowing = true }));
        }

        [HttpGet("artists/{artistId}/status")]
        public async Task<IActionResult> GetArtistFollowStatus(Guid artistId)
        {
            if (!Guid.TryParse(CurrentUserId, out var userId))
            {
                return Unauthorized(ApiResponse<object>.ToFailure("Invalid token."));
            }

            using var connection = _connectionFactory.CreateConnection();
            var isFollowing = await connection.ExecuteScalarAsync<bool>(
                "SELECT COUNT(1) FROM ArtistFollows WHERE UserId = @UserId AND ArtistId = @ArtistId",
                new { UserId = userId, ArtistId = artistId });

            return Ok(ApiResponse<object>.ToSuccess(new { IsFollowing = isFollowing }));
        }

        [HttpGet("artists/{artistId}/count")]
        [AllowAnonymous]
        public async Task<IActionResult> GetArtistFollowerCount(Guid artistId)
        {
            using var connection = _connectionFactory.CreateConnection();
            var count = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM ArtistFollows WHERE ArtistId = @ArtistId",
                new { ArtistId = artistId });

            return Ok(ApiResponse<object>.ToSuccess(new { FollowersCount = count }));
        }

        [HttpGet("artists/following")]
        public async Task<IActionResult> GetFollowingArtists()
        {
            if (!Guid.TryParse(CurrentUserId, out var userId))
            {
                return Unauthorized(ApiResponse<object>.ToFailure("Invalid token."));
            }

            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT a.ArtistId, a.Name, a.Description, a.AvatarUrl, a.CoverImageUrl, a.CreatedAt
                FROM ArtistFollows af
                INNER JOIN Artists a ON a.ArtistId = af.ArtistId
                WHERE af.UserId = @UserId
                ORDER BY af.FollowedAt DESC";

            var artists = await connection.QueryAsync<FollowArtistItem>(sql, new { UserId = userId });
            return Ok(ApiResponse<object>.ToSuccess(artists));
        }

        [HttpGet("users/{userId}/artists/following")]
        public async Task<IActionResult> GetUserFollowingArtists(Guid userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT a.ArtistId, a.Name, a.Description, a.AvatarUrl, a.CoverImageUrl, a.CreatedAt
                FROM ArtistFollows af
                INNER JOIN Artists a ON a.ArtistId = af.ArtistId
                WHERE af.UserId = @UserId
                ORDER BY af.FollowedAt DESC";

            var artists = await connection.QueryAsync<FollowArtistItem>(sql, new { UserId = userId });
            return Ok(ApiResponse<object>.ToSuccess(artists));
        }

        private sealed class FollowUserItem
        {
            public Guid Id { get; set; }
            public string UserName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string? DisplayName { get; set; }
            public string? Bio { get; set; }
            public string? AvatarUrl { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        private sealed class FollowCounts
        {
            public int FollowersCount { get; set; }
            public int FollowingCount { get; set; }
        }

        private sealed class FollowArtistItem
        {
            public Guid ArtistId { get; set; }
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public string? AvatarUrl { get; set; }
            public string? CoverImageUrl { get; set; }
            public DateTime CreatedAt { get; set; }
        }
    }
}
