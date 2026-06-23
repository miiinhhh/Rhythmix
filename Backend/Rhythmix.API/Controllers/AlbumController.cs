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
    private readonly IWebHostEnvironment _env;

    public AlbumsController(IMediator mediator, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _env = env;
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
    public async Task<IActionResult> CreateAlbum([FromForm] CreateAlbumFormRequest request)
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

        string? coverImageUrl = request.CoverImageUrl;

        try
        {
            var uploadedCoverUrl = await SaveAlbumCoverImageAsync(request.CoverImage);
            if (!string.IsNullOrWhiteSpace(uploadedCoverUrl))
            {
                coverImageUrl = uploadedCoverUrl;
            }
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }

        var command = new CreateAlbumCommand
        {
            OwnerId = userId,
            Title = request.Title,
            Description = request.Description,
            CoverImageUrl = coverImageUrl,
            ReleaseDate = request.ReleaseDate
        };

        var result = await _mediator.Send(command);
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Update album
    /// </summary>
    [HttpPut("{albumId}")]
    public async Task<IActionResult> UpdateAlbum(Guid albumId, [FromForm] UpdateAlbumFormRequest request)
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

        string? coverImageUrl = request.CoverImageUrl;

        try
        {
            var uploadedCoverUrl = await SaveAlbumCoverImageAsync(request.CoverImage);
            if (!string.IsNullOrWhiteSpace(uploadedCoverUrl))
            {
                coverImageUrl = uploadedCoverUrl;
            }

            var command = new UpdateAlbumCommand
            {
                AlbumId = albumId,
                UserId = userId,
                Title = request.Title,
                Description = request.Description,
                CoverImageUrl = coverImageUrl,
                ReleaseDate = request.ReleaseDate
            };

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
            return BadRequest(new { success = false, message = ex.Message });
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
    private async Task<string?> SaveAlbumCoverImageAsync(IFormFile? coverImage)
    {
        if (coverImage == null || coverImage.Length == 0)
        {
            return null;
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(coverImage.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Only jpg, jpeg, png, webp images are allowed.");
        }

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "albums");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await coverImage.CopyToAsync(stream);

        return $"/uploads/albums/{fileName}";
    }
}
public sealed class CreateAlbumFormRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public IFormFile? CoverImage { get; set; }
    public DateTime? ReleaseDate { get; set; }
}

public sealed class UpdateAlbumFormRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public IFormFile? CoverImage { get; set; }
    public DateTime? ReleaseDate { get; set; }
}