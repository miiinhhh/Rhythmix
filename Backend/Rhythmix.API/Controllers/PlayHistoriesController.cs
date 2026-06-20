using System.Security.Claims;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Rhythmix.Application.DTOs.History;

namespace Rhythmix.API.Controllers;

[ApiController]
[Route("api/play-histories")]
[Authorize]
public class PlayHistoriesController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public PlayHistoriesController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private SqlConnection CreateConnection()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        return new SqlConnection(connectionString);
    }

    private Guid? GetCurrentUserId()
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("id")
            ?? User.FindFirstValue("userId");

        if (Guid.TryParse(userIdValue, out var userId))
        {
            return userId;
        }

        return null;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyPlayHistories([FromQuery] int take = 10)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Không xác định được người dùng từ token."
            });
        }

        if (take <= 0) take = 10;
        if (take > 10) take = 10;

        const string sql = """
            SELECT TOP (@Take)
                MediaId,
                PlayedAt
            FROM PlayHistories
            WHERE UserId = @UserId
            ORDER BY PlayedAt DESC;
            """;

        using var connection = CreateConnection();

        var histories = await connection.QueryAsync<PlayHistoryDto>(sql, new
        {
            UserId = userId.Value,
            Take = take
        });

        return Ok(histories);
    }

    [HttpPost]
    public async Task<IActionResult> AddPlayHistory([FromBody] AddPlayHistoryRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Không xác định được người dùng từ token."
            });
        }

        if (request.MediaId == Guid.Empty)
        {
            return BadRequest(new
            {
                success = false,
                message = "MediaId không được để trống."
            });
        }

        const string sql = """
            DELETE FROM PlayHistories
            WHERE UserId = @UserId AND MediaId = @MediaId;

            INSERT INTO PlayHistories
            (
                HistoryId,
                UserId,
                MediaId,
                PlayedAt
            )
            VALUES
            (
                NEWID(),
                @UserId,
                @MediaId,
                GETDATE()
            );
            """;

        using var connection = CreateConnection();

        await connection.ExecuteAsync(sql, new
        {
            UserId = userId.Value,
            MediaId = request.MediaId
        });

        return Ok(new
        {
            success = true,
            message = "Đã lưu lịch sử nghe."
        });
    }

    [HttpDelete]
    public async Task<IActionResult> ClearMyPlayHistories()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Không xác định được người dùng từ token."
            });
        }

        const string sql = """
            DELETE FROM PlayHistories
            WHERE UserId = @UserId;
            """;

        using var connection = CreateConnection();

        await connection.ExecuteAsync(sql, new
        {
            UserId = userId.Value
        });

        return Ok(new
        {
            success = true,
            message = "Đã xóa lịch sử nghe."
        });
    }
}