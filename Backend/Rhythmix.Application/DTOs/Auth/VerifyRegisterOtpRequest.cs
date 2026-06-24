namespace Rhythmix.Application.DTOs.Auth;

public class VerifyRegisterOtpRequest
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}