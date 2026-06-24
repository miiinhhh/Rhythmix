namespace Rhythmix.Application.DTOs.Auth;

public class SendRegisterOtpRequest
{
    public string Email { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}