using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.DTOs.Playlist;
using Rhythmix.Application.UseCases.Playlist;


namespace Rhythmix.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class PlaylistsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlaylistsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tạo mới một playlist
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreatePlaylistAsync([FromBody] CreatePlaylistRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        var command = new CreatePlaylistCommand
        {
            OwnerId = userId,
            Name = request.Name,
            Description = request.Description,
            IsPublic = request.IsPublic
        };

        try
        {
            var result = await _mediator.Send(command);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết của một playlist, bao gồm danh sách bài hát
    /// </summary>
    [HttpGet("{playlistId}")]
    public async Task<IActionResult> GetPlaylistAsync(Guid playlistId)
    {
        var query = new GetPlaylistByIdQuery { PlaylistId = playlistId };
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { success = false, message = "Playlist not found." });
        }

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Lấy danh sách playlist của user hiện tại
    /// </summary>
    [HttpGet("my-playlists")]
    public async Task<IActionResult> GetMyPlaylistsAsync()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        var query = new GetUserPlaylistsQuery { UserId = userId };
        var result = await _mediator.Send(query);

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Lấy danh sách playlist của một user cụ thể (công khai)
    /// </summary>
    [HttpGet("user/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUserPlaylistsAsync(Guid userId)
    {
        var query = new GetUserPlaylistsQuery { UserId = userId };
        var result = await _mediator.Send(query);

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Thêm một track vào playlist
    /// </summary>
    [HttpPost("{playlistId}/tracks")]
    public async Task<IActionResult> AddTrackAsync(Guid playlistId, [FromBody] AddTrackRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        try
        {
            var command = new AddTrackToPlaylistCommand
            {
                PlaylistId = playlistId,
                MediaId = request.MediaId,
                UserId = userId,
                SortOrder = request.SortOrder
            };

            var result = await _mediator.Send(command);
            return Ok(new { success = true, data = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
        {
            return Conflict(new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Xóa một track khỏi playlist
    /// </summary>
    [HttpDelete("{playlistId}/tracks/{mediaId}")]
    public async Task<IActionResult> RemoveTrackAsync(Guid playlistId, Guid mediaId)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        try
        {
            var command = new RemoveTrackFromPlaylistCommand
            {
                PlaylistId = playlistId,
                MediaId = mediaId,
                UserId = userId
            };

            var result = await _mediator.Send(command);
            return Ok(new { success = true, message = "Track removed successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật trạng thái công khai của playlist
    /// </summary>
    [HttpPut("{playlistId}/visibility")]
    public async Task<IActionResult> UpdateVisibilityAsync(Guid playlistId, [FromBody] UpdateVisibilityRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        try
        {
            var command = new SetPlaylistVisibilityCommand
            {
                PlaylistId = playlistId,
                UserId = userId,
                IsPublic = request.IsPublic
            };

            var result = await _mediator.Send(command);
            return Ok(new { success = true, data = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật thông tin playlist (tên, mô tả)
    /// </summary>
    [HttpPut("{playlistId}")]
    public async Task<IActionResult> UpdatePlaylistInfoAsync(Guid playlistId, [FromBody] UpdatePlaylistInfoRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { success = false, message = "Playlist name is required." });
        }

        try
        {
            var command = new UpdatePlaylistInfoCommand
            {
                PlaylistId = playlistId,
                UserId = userId,
                Name = request.Name,
                Description = request.Description
            };

            var result = await _mediator.Send(command);
            return Ok(new { success = true, data = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Xóa một playlist
    /// </summary>
    [HttpDelete("{playlistId}")]
    public async Task<IActionResult> DeletePlaylistAsync(Guid playlistId)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        try
        {
            var command = new DeletePlaylistCommand
            {
                PlaylistId = playlistId,
                UserId = userId
            };

            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { success = false, message = "Playlist not found." });
            }

            return Ok(new { success = true, message = "Playlist deleted successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật thứ tự sắp xếp của một track trong playlist
    /// </summary>
    [HttpPut("{playlistId}/tracks/{mediaId}/sort-order")]
    public async Task<IActionResult> UpdateTrackSortOrderAsync(
        Guid playlistId,
        Guid mediaId,
        [FromBody] UpdateTrackSortOrderRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        try
        {
            var command = new UpdateTrackSortOrderCommand
            {
                PlaylistId = playlistId,
                MediaId = mediaId,
                UserId = userId,
                NewSortOrder = request.NewSortOrder
            };

            var result = await _mediator.Send(command);
            return Ok(new { success = true, data = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
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