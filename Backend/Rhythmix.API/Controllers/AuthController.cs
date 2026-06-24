using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Rhythmix.Application.DTOs.Auth;
using Rhythmix.Application.UseCases.Auth;
using Rhythmix.Application.Common.Interfaces;

namespace Rhythmix.API.Controllers;
/*{
  "email": "Minh@gmail.com",
  "password": "12345678"
}*/
//dotnet run --project Backend/Rhythmix.API --urls "http://0.0.0.0:5269"
[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMemoryCache _cache;
    private readonly IEmailService _emailService;

    public AuthController(
    IMediator mediator,
    IMemoryCache cache,
    IEmailService emailService)
    {
        _mediator = mediator;
        _cache = cache;
        _emailService = emailService;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Trả về rõ ràng thông tin validation cho client
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = ModelState.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>())
            });
        }

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

    [AllowAnonymous]
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
            return Unauthorized(new
            {
                success = false,
                message = "Invalid email or password."
            });
        }

        return Ok(new { success = true, data = result });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userIdClaim) ||
            !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid or missing user identity."
            });
        }

        var command = new LogoutCommand { UserId = userId };
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "User not found."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Logout successful. Please remove the access token from client storage."
        });
    }

    [AllowAnonymous]
    [HttpPost("register/send-otp")]
    public async Task<IActionResult> SendRegisterOtp([FromBody] SendRegisterOtpRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Email is required."
                });
            }

            var otp = Random.Shared.Next(100000, 999999).ToString();

            var key = $"REGISTER_OTP_{request.Email.ToLower()}";

            _cache.Set(
                key,
                otp,
                TimeSpan.FromMinutes(5)
            );

            var subject = "Tune Vault - Your OTP Code";

            var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border-radius: 12px; background: #111; color: #fff;'>
                <h2 style='color: #22c55e;'>Tune Vault Email Verification</h2>
                <p>Hello {request.UserName},</p>
                <p>Your OTP code is:</p>
                <div style='font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #22c55e; margin: 20px 0;'>
                    {otp}
                </div>
                <p>This code will expire in 5 minutes.</p>
            </div>
        ";

            await _emailService.SendEmailAsync(request.Email, subject, body);

            Console.WriteLine($"OTP sent to {request.Email}: {otp}");

            return Ok(new
            {
                success = true,
                message = "OTP sent successfully."
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine("SEND OTP ERROR:");
            Console.WriteLine(ex.ToString());

            return StatusCode(500, new
            {
                success = false,
                message = ex.Message,
                detail = ex.ToString()
            });
        }
    }

    [AllowAnonymous]
    [HttpPost("register/verify-otp")]
    public IActionResult VerifyRegisterOtp([FromBody] VerifyRegisterOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Otp))
        {
            return BadRequest(new
            {
                success = false,
                message = "Email and OTP are required."
            });
        }

        var key = $"REGISTER_OTP_{request.Email.ToLower()}";

        if (!_cache.TryGetValue(key, out string? savedOtp))
        {
            return BadRequest(new
            {
                success = false,
                message = "OTP expired or not found."
            });
        }

        if (savedOtp != request.Otp)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid OTP."
            });
        }

        _cache.Remove(key);

        return Ok(new
        {
            success = true,
            message = "OTP verified successfully."
        });
    }
}