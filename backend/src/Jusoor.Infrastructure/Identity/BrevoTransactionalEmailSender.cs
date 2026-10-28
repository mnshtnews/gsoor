using System.Net.Http.Json;
using System.Text.Encodings.Web;
using Jusoor.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jusoor.Infrastructure.Identity;

/// <summary>Brevo transactional-email adapter; API credentials stay in environment secrets.</summary>
public sealed class BrevoTransactionalEmailSender(HttpClient client, IConfiguration configuration, ILogger<BrevoTransactionalEmailSender> logger) : ITransactionalEmailSender
{
    private string ApiKey => configuration["Email:BrevoApiKey"]?.Trim() ?? "";
    private string FromAddress => configuration["Email:FromAddress"]?.Trim() ?? "";
    private string FromName => configuration["Email:FromName"]?.Trim() ?? "جسور";
    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey) && !string.IsNullOrWhiteSpace(FromAddress);

    public async Task<bool> SendLoginCodeAsync(string recipient, string code, CancellationToken cancellationToken)
    {
        if (!IsConfigured) return false;
        var encodedCode = HtmlEncoder.Default.Encode(code);
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
        request.Headers.TryAddWithoutValidation("api-key", ApiKey);
        request.Content = JsonContent.Create(new
        {
            sender = new { email = FromAddress, name = FromName },
            to = new[] { new { email = recipient } },
            subject = "رمز الدخول إلى جسور",
            textContent = $"رمز التحقق الخاص بك هو {code}. صالح لمدة 10 دقائق. إذا لم تطلبه فتجاهل هذه الرسالة.",
            htmlContent = $"<div dir=\"rtl\" style=\"font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#17243a\"><h2>رمز التحقق — جسور</h2><p>استخدم الرمز التالي لتأكيد بريدك الإلكتروني:</p><div style=\"font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f2f5fa;text-align:center;border-radius:10px\">{encodedCode}</div><p>ينتهي الرمز خلال 10 دقائق. لا تشاركه مع أي شخص.</p><small>إذا لم تطلب هذا الرمز، يمكنك تجاهل الرسالة.</small></div>"
        });
        try
        {
            using var response = await client.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode) return true;
            logger.LogWarning("Brevo transactional email was rejected with HTTP {StatusCode}.", (int)response.StatusCode);
            return false;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Brevo transactional email request timed out.");
            return false;
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning("Brevo transactional email request failed: {ExceptionType}.", exception.GetType().Name);
            return false;
        }
    }
}
