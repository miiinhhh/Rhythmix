// Rhythmix.API/Controllers/AlbumController.cs
using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.DTOs.Album;
using Rhythmix.Application.UseCases.Album;


namespace Rhythmix.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class AlbumsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AlbumsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get album by ID
    /// </summary>
    [HttpGet("{albumId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAlbum(Guid albumId)
    {
        var query = new GetAlbumByIdQuery { AlbumId = albumId };
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { success = false, message = "Album not found." });
        }

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Get all albums of current user
    /// </summary>
    [HttpGet("my-albums")]
    public async Task<IActionResult> GetMyAlbums()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        var query = new GetMyAlbumsQuery { UserId = userId };
        var result = await _mediator.Send(query);

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Create a new album
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateAlbum([FromBody] CreateAlbumRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { success = false, message = "Album title is required." });
        }

        var command = new CreateAlbumCommand
        {
            OwnerId = userId,
            Title = request.Title,
            Description = request.Description,
            CoverImageUrl = request.CoverImageUrl,
            ReleaseDate = request.ReleaseDate
        };

        var result = await _mediator.Send(command);
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Update album
    /// </summary>
    [HttpPut("{albumId}")]
    public async Task<IActionResult> UpdateAlbum(Guid albumId, [FromBody] UpdateAlbumRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { success = false, message = "Album title is required." });
        }

        var command = new UpdateAlbumCommand
        {
            AlbumId = albumId,
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            CoverImageUrl = request.CoverImageUrl,
            ReleaseDate = request.ReleaseDate
        };

        try
        {
            var result = await _mediator.Send(command);
            if (result == null)
            {
                return NotFound(new { success = false, message = "Album not found or you don't have permission." });
            }
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
    }

    /// <summary>
    /// Delete album
    /// </summary>
    [HttpDelete("{albumId}")]
    public async Task<IActionResult> DeleteAlbum(Guid albumId)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        var command = new DeleteAlbumCommand
        {
            AlbumId = albumId,
            UserId = userId
        };

        try
        {
            var result = await _mediator.Send(command);
            if (!result)
            {
                return NotFound(new { success = false, message = "Album not found or you don't have permission." });
            }
            return Ok(new { success = true, message = "Album deleted successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(claim, out var userId) ? userId : Guid.Empty;
    }
}