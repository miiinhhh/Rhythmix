using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.DTOs.Share;
using Rhythmix.Application.UseCases.Share;

namespace Rhythmix.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class SharesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SharesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Chia sẻ một bài hát hoặc playlist với người dùng khác.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> ShareMedia([FromBody] CreateShareRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        try
        {
            var command = new CreateShareCommand
            {
                SenderId = userId,
                ReceiverId = request.ReceiverId,
                MediaId = request.MediaId,
                PlaylistId = request.PlaylistId,
                Message = request.Message
            };

            var result = await _mediator.Send(command);
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Nhận tất cả bài hát và playlist được chia sẻ với tôi (inbox)
    /// </summary>
    [HttpGet("inbox")]
    public async Task<IActionResult> GetSharedWithMe()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        try
        {
            var query = new GetSharedWithMeQuery { UserId = userId };
            var result = await _mediator.Send(query);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Nhận tất cả bài hát và playlist mà tôi đã chia sẻ với người khác (outbox)
    /// </summary>
    [HttpGet("outbox")]
    public async Task<IActionResult> GetSharedByMe()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        try
        {
            var query = new GetSharedByMeQuery { UserId = userId };
            var result = await _mediator.Send(query);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(claim, out var userId) ? userId : Guid.Empty;
    }
}
