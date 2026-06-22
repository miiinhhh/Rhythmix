using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Infrastructure.Services;

namespace Rhythmix.Infrastructure.Email;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var email = new MimeMessage();

        email.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = subject;

        email.Body = new TextPart("html")
        {
            Text = body
        };

        using var smtp = new SmtpClient();

        await smtp.ConnectAsync(
            _settings.SmtpHost,
            _settings.SmtpPort,
            SecureSocketOptions.StartTls
        );

        var senderPassword = _settings.SenderPassword.Replace(" ", "");

        await smtp.AuthenticateAsync(
            _settings.SenderEmail,
            senderPassword
        );
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}