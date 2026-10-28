namespace Jusoor.Application.Common.Interfaces;

public enum EmailOtpStartOutcome { Accepted, InvalidCredentials, EmailAlreadyRegistered, RateLimited, DeliveryUnavailable, NotConfigured }
public sealed record EmailOtpStartResult(EmailOtpStartOutcome Outcome);
public enum EmailOtpCompletionOutcome { Succeeded, InvalidOrExpiredCode, RateLimited, NotConfigured }
public sealed record EmailOtpCompletionResult(EmailOtpCompletionOutcome Outcome, AuthTokenResult? Tokens = null);

public interface IEmailOtpAuthService
{
    Task<EmailOtpStartResult> RegisterAsync(string email, string password, string displayName, CancellationToken cancellationToken);
    Task<EmailOtpStartResult> ResendAsync(string email, string password, string purpose, CancellationToken cancellationToken);
    Task<EmailOtpCompletionResult> VerifyAsync(string email, string code, CancellationToken cancellationToken);
}
