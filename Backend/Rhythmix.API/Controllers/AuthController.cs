using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.DTOs.Auth;
using Rhythmix.Application.UseCases.Auth;

namespace Rhythmix.API.Controllers;
/*{
  "email": "Minh@gmail.com",
  "password": "12345678"
}*/
[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var command = new RegisterCommand
        {
            Email = request.Email,
            UserName = request.UserName,
            Password = request.Password,
            DisplayName = request.DisplayName,
            Bio = request.Bio,
            AvatarUrl = request.AvatarUrl
        };

        try
        {
            var result = await _mediator.Send(command);
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var query = new LoginQuery
        {
            Email = request.Email,
            Password = request.Password
        };

        var result = await _mediator.Send(query);
        if (result is null)
        {
            return Unauthorized(new { success = false, message = "Invalid email or password." });
        }

        return Ok(new { success = true, data = result });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Invalid or missing user identity." });
        }

        var command = new LogoutCommand { UserId = userId };
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(new { success = false, message = "User not found." });
        }

        return Ok(new
        {
            success = true,
            message = "Logout successful. Please remove the access token from client storage."
        });
    }
}
