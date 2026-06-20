using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.API.DTOs;
using Rhythmix.Application.DTOs.Playlist;
using Rhythmix.Application.UseCases.Playlist;
using Microsoft.AspNetCore.Http;
using Rhythmix.Domain.Interfaces;


namespace Rhythmix.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class PlaylistsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IFileStorageService _fileStorageService;

    public PlaylistsController(IMediator mediator, IFileStorageService fileStorageService)
    {
        _mediator = mediator;
        _fileStorageService = fileStorageService;
    }

    /// <summary>
    /// Tạo mới một playlist
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreatePlaylistAsync([FromForm] CreatePlaylistFormRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        try
        {
            var coverImageUrl = await SaveCoverImageAsync(request.CoverImage);
            var command = new CreatePlaylistCommand
            {
                OwnerId = userId,
                Name = request.Name,
                Description = request.Description,
                CoverImageUrl = coverImageUrl,
                IsPublic = request.IsPublic
            };

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
    [HttpGet("{playlistId:guid}")]
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

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicPlaylistsAsync()
    {
        var query = new GetPublicPlaylistsQuery();
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
    [HttpPost("{playlistId:guid}/tracks")]
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
    [HttpDelete("{playlistId:guid}/tracks/{mediaId:guid}")]
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
    [HttpPut("{playlistId:guid}/visibility")]
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
    /// Cập nhật thông tin playlist (tên, mô tả, ảnh bìa)
    /// </summary>
    [HttpPut("{playlistId:guid}")]
    public async Task<IActionResult> UpdatePlaylistAsync(Guid playlistId, [FromForm] UpdatePlaylistFormRequest request)
    {
        // Kiểm tra log xem request nhận được gì
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { success = false, message = "Tên playlist không được để trống" });
        }

        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            string? newCoverUrl = null;
            if (request.CoverImage != null)
            {
                newCoverUrl = await SaveCoverImageAsync(request.CoverImage);
            }

            var command = new UpdatePlaylistInfoCommand
            {
                PlaylistId = playlistId, // Đảm bảo khớp với Guid trên URL
                UserId = userId,
                Name = request.Name,
                Description = request.Description,
                CoverImageUrl = newCoverUrl
            };

            var result = await _mediator.Send(command);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
    /// <summary>
    /// Xóa một playlist
    /// </summary>
    [HttpDelete("{playlistId:guid}")]
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
    [HttpPut("{playlistId:guid}/tracks/{mediaId:guid}/sort-order")]
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

    private async Task<string?> SaveCoverImageAsync(IFormFile? coverImage)
    {
        if (coverImage is not { Length: > 0 })
        {
            return null;
        }

        var extension = Path.GetExtension(coverImage.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Invalid cover image format. Only jpg, png and webp files are allowed.");
        }

        using var stream = coverImage.OpenReadStream();
        return await _fileStorageService.SaveFileAsync(stream, coverImage.FileName, "images");
    }
}
