// Rhythmix.API/Controllers/MediaController.cs
using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.API.DTOs;
using Rhythmix.Application.UseCases.Media;

namespace Rhythmix.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class MediaController : ControllerBase
{
    private readonly IMediator _mediator;

    public MediaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Upload media file (audio/video)
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(500_000_000)] // 500MB
    public async Task<IActionResult> UploadMedia([FromForm] UploadMediaRequestDto request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        if (request.File == null || request.File.Length == 0)
        {
            return BadRequest(new { success = false, message = "No file uploaded." });
        }

        // Validate file extension
        var extension = Path.GetExtension(request.File.FileName).ToLower();
        var allowedExtensions = new[] { ".mp3", ".wav", ".m4a", ".flac", ".ogg", ".mp4", ".webm", ".mkv" };
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { success = false, message = "Invalid file format. Only audio and video files are allowed." });
        }

        if (request.CoverImage is { Length: > 0 })
        {
            var coverExtension = Path.GetExtension(request.CoverImage.FileName).ToLowerInvariant();
            var allowedCoverExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowedCoverExtensions.Contains(coverExtension))
            {
                return BadRequest(new { success = false, message = "Invalid cover image format. Only jpg, png and webp files are allowed." });
            }
        }

        try
        {
            using var stream = request.File.OpenReadStream();
            using var coverStream = request.CoverImage is { Length: > 0 }
                ? request.CoverImage.OpenReadStream()
                : null;

            var command = new UploadMediaCommand
            {
                Title = request.Title,
                Description = request.Description,
                AlbumId = request.AlbumId,
                GenreId = request.GenreId,
                IsPublic = request.IsPublic,
                OwnerId = userId,
                FileStream = stream,
                FileName = request.File.FileName,
                ContentType = request.File.ContentType,
                FileLength = request.File.Length,
                CoverImageStream = coverStream,
                CoverImageFileName = request.CoverImage?.FileName
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
    /// Get recent public media for discovery
    /// </summary>
    [HttpGet("discovery")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDiscovery([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = new GetRecentMediaQuery { Page = page, PageSize = pageSize };
        var result = await _mediator.Send(query);

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Get media by ID
    /// </summary>
    [HttpGet("{mediaId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMedia(Guid mediaId)
    {
        var query = new GetMediaByIdQuery { MediaId = mediaId };
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { success = false, message = "Media not found." });
        }

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Stream media file (audio/video)
    /// </summary>
    [HttpGet("{mediaId}/stream")]
    [AllowAnonymous]
    public async Task<IActionResult> StreamMedia(Guid mediaId)
    {
        var rangeHeader = Request.Headers.Range.ToString();
        var query = new StreamMediaQuery
        {
            MediaId = mediaId,
            Range = string.IsNullOrEmpty(rangeHeader) ? null : rangeHeader
        };

        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { success = false, message = "Media not found." });
        }

        if (result.IsPartialContent)
        {
            Response.Headers.Append("Content-Range", $"bytes {result.StartPosition}-{result.EndPosition}/{result.FileSize}");
            Response.Headers.Append("Accept-Ranges", "bytes");
            return File(result.FileStream, result.ContentType, enableRangeProcessing: true);
        }

        Response.Headers.Append("Accept-Ranges", "bytes");
        return File(result.FileStream, result.ContentType);
    }

    /// <summary>
    /// Get my media library
    /// </summary>
    [HttpGet("my-media")]
    public async Task<IActionResult> GetMyMedia([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = new GetMediaByOwnerQuery { OwnerId = userId, Page = page, PageSize = pageSize };
        var result = await _mediator.Send(query);

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Delete media
    /// </summary>
    [HttpDelete("{mediaId}")]
    public async Task<IActionResult> DeleteMedia(Guid mediaId)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        var command = new DeleteMediaCommand { MediaId = mediaId, UserId = userId };
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(new { success = false, message = "Media not found or you don't have permission." });
        }

        return Ok(new { success = true, message = "Media deleted successfully." });
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(claim, out var userId) ? userId : Guid.Empty;
    }
}
