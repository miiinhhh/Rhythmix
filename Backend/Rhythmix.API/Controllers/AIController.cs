using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.UseCases.AI;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Rhythmix.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IMediator _mediator;

    public AIController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gợi ý bài hát thông minh dựa trên lịch sử nghe và danh sách yêu thích.
    /// </summary>
    /// <param name="limit">Số lượng gợi ý (mặc định: 10, tối đa: 20)</param>
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations([FromQuery] int limit = 10)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "User not found" });

            limit = Math.Clamp(limit, 1, 20);

            var query = new GetRecommendationsQuery(userId, limit);
            var result = await _mediator.Send(query);

            return Ok(new
            {
                success = true,
                data = result.MediaItems,
                source = result.Source,
                reason = result.Reason
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
