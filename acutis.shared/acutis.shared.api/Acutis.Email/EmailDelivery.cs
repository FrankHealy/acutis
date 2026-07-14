using System.Net.Sockets;
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Utils;

namespace Acutis.Email;

public sealed record EmailMessage(string To, string Subject, string TextBody, string HtmlBody);
public enum EmailFailureCategory { None, ConfigurationMissing, Authentication, TransientProvider, PermanentProvider, Cancelled }
public sealed record EmailSendResult(bool Succeeded, EmailFailureCategory FailureCategory = EmailFailureCategory.None, string? SanitisedFailureReason = null, string? ProviderMessageId = null);
public sealed record EmailHealthResult(bool Healthy, EmailFailureCategory FailureCategory, string Status);

public interface IEmailSender { Task<EmailSendResult> SendAsync(EmailMessage message, CancellationToken cancellationToken); }
public interface IEmailHealthProbe { Task<EmailHealthResult> CheckAsync(CancellationToken cancellationToken); }

public sealed class EmailOptions
{
    public string Provider { get; set; } = "ZohoSmtp";
    public string Host { get; set; } = "smtppro.zoho.eu";
    public int Port { get; set; } = 587;
    public bool StartTls { get; set; } = true;
    public string Username { get; set; } = "invitations@salientrecovery.com";
    public string Password { get; set; } = "";
    public string FromAddress { get; set; } = "invitations@salientrecovery.com";
    public string FromName { get; set; } = "Acutis Practitioner";
    public string SupportAddress { get; set; } = "enquiries@salientrecovery.com";
    public int TimeoutSeconds { get; set; } = 20;
    public int MaximumAttempts { get; set; } = 3;

    public string? Validate()
    {
        if (!string.Equals(Provider, "ZohoSmtp", StringComparison.OrdinalIgnoreCase)) return "Unsupported email provider.";
        if (string.IsNullOrWhiteSpace(Host) || Port is < 1 or > 65535) return "SMTP host or port is missing.";
        if (string.IsNullOrWhiteSpace(Username) || string.IsNullOrWhiteSpace(Password)) return "SMTP credentials are missing.";
        if (!MailboxAddress.TryParse(FromAddress, out _) || !MailboxAddress.TryParse(SupportAddress, out _)) return "Email sender or support address is invalid.";
        return null;
    }
}

public sealed class ZohoSmtpEmailSender(IOptions<EmailOptions> configured, ILogger<ZohoSmtpEmailSender> logger) : IEmailSender, IEmailHealthProbe
{
    private readonly EmailOptions options = configured.Value;

    public async Task<EmailSendResult> SendAsync(EmailMessage message, CancellationToken cancellationToken)
    {
        var validation = options.Validate();
        if (validation is not null) return new(false, EmailFailureCategory.ConfigurationMissing, validation);
        if (!MailboxAddress.TryParse(message.To, out var recipient)) return new(false, EmailFailureCategory.PermanentProvider, "The destination address is invalid.");

        var mime = new MimeMessage { MessageId = MimeUtils.GenerateMessageId() };
        mime.From.Add(new MailboxAddress(options.FromName, options.FromAddress));
        mime.To.Add(recipient);
        mime.Subject = message.Subject;
        mime.Body = new BodyBuilder { TextBody = message.TextBody, HtmlBody = message.HtmlBody }.ToMessageBody();

        for (var attempt = 1; attempt <= Math.Clamp(options.MaximumAttempts, 1, 5); attempt++)
        {
            var result = await SendOnceAsync(mime, cancellationToken);
            if (result.Succeeded || result.FailureCategory is not EmailFailureCategory.TransientProvider || attempt == Math.Clamp(options.MaximumAttempts, 1, 5)) return result;
            logger.LogWarning("Email provider reported a transient failure; retrying delivery (attempt {Attempt}).", attempt + 1);
            await Task.Delay(TimeSpan.FromMilliseconds(250 * attempt), cancellationToken);
        }
        return new(false, EmailFailureCategory.TransientProvider, "Email delivery was not completed.");
    }

    public async Task<EmailHealthResult> CheckAsync(CancellationToken cancellationToken)
    {
        var validation = options.Validate();
        if (validation is not null) return new(false, EmailFailureCategory.ConfigurationMissing, "configuration-missing");
        try
        {
            using var client = CreateClient();
            await client.ConnectAsync(options.Host, options.Port, options.StartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto, cancellationToken);
            await client.AuthenticateAsync(options.Username, options.Password, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
            return new(true, EmailFailureCategory.None, "available");
        }
        catch (AuthenticationException) { return new(false, EmailFailureCategory.Authentication, "authentication-failed"); }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested) { return new(false, EmailFailureCategory.TransientProvider, "provider-timeout"); }
        catch (Exception exception) when (IsTransient(exception)) { return new(false, EmailFailureCategory.TransientProvider, "provider-unavailable"); }
        catch { return new(false, EmailFailureCategory.PermanentProvider, "provider-failure"); }
    }

    private async Task<EmailSendResult> SendOnceAsync(MimeMessage message, CancellationToken cancellationToken)
    {
        try
        {
            using var client = CreateClient();
            await client.ConnectAsync(options.Host, options.Port, options.StartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto, cancellationToken);
            await client.AuthenticateAsync(options.Username, options.Password, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
            return new(true, ProviderMessageId: message.MessageId);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { return new(false, EmailFailureCategory.Cancelled, "Email delivery was cancelled."); }
        catch (AuthenticationException) { return new(false, EmailFailureCategory.Authentication, "SMTP authentication failed."); }
        catch (SmtpCommandException exception) when ((int)exception.StatusCode is >= 400 and < 500) { return new(false, EmailFailureCategory.TransientProvider, "The email provider temporarily rejected delivery."); }
        catch (SmtpCommandException) { return new(false, EmailFailureCategory.PermanentProvider, "The email provider rejected delivery."); }
        catch (OperationCanceledException) { return new(false, EmailFailureCategory.TransientProvider, "The email provider timed out."); }
        catch (Exception exception) when (IsTransient(exception)) { return new(false, EmailFailureCategory.TransientProvider, "The email provider is temporarily unavailable."); }
        catch { return new(false, EmailFailureCategory.PermanentProvider, "Email delivery failed."); }
    }

    private SmtpClient CreateClient() => new() { Timeout = Math.Clamp(options.TimeoutSeconds, 5, 120) * 1000 };
    private static bool IsTransient(Exception exception) => exception is IOException or SocketException or ServiceNotConnectedException or ServiceNotAuthenticatedException;
}
