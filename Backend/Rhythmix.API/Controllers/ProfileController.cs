using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.API.DTOs;
using Rhythmix.Application.DTOs.Profile;
using Rhythmix.Application.UseCases.Profile;

namespace Rhythmix.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class ProfileController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProfileController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("me")] 
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid token." });
        }

        var query = new GetProfileQuery { UserId = userId };
        var profile = await _mediator.Send(query);
        if (profile is null)
        {
            return NotFound(new { success = false, message = "Profile not found." });
        }

        return Ok(new { success = true, data = profile });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty || userId != request.Id)
        {
            return Forbid();
        }

        var command = new UpdateProfileCommand
        {
            Id = request.Id,
            UserName = request.UserName,
            DisplayName = request.DisplayName,
            Bio = request.Bio,
            AvatarUrl = request.AvatarUrl
        };

        var profile = await _mediator.Send(command);
        if (profile is null)
        {
            return NotFound(new { success = false, message = "User not found." });
        }

        return Ok(new { success = true, data = profile });
    }

    [HttpPost("me/avatar")]
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> UploadAvatar([FromForm] UploadAvatarRequestDto request)
    {
        var file = request.File;
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { success = false, message = "No file uploaded." });
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { success = false, message = "Invalid avatar format." });
        }

        var avatarsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
        Directory.CreateDirectory(avatarsDir);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(avatarsDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return Ok(new
        {
            success = true,
            data = new { avatarUrl = $"/uploads/avatars/{fileName}" }
        });
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(claim, out var userId) ? userId : Guid.Empty;
    }
}