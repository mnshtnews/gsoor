using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Jusoor.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jusoor.Infrastructure.Identity;

/// <summary>Issues one-time six digit email codes and exchanges verified codes for JWTs.</summary>
public sealed class EmailOtpAuthService(
    UserManager<ApplicationUser> users,
    IJwtTokenService jwtTokens,
    ITransactionalEmailSender emailSender,
    IConfiguration configuration,
    ILogger<EmailOtpAuthService> logger) : IEmailOtpAuthService
{
    private const string LoginProvider = "JusoorEmailOtp";
    private const string TokenName = "Challenge";
    private const int MaxAttempts = 5;
    private static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan ResendDelay = TimeSpan.FromSeconds(60);

    private sealed record Challenge(string Purpose, string CodeHash, DateTimeOffset ExpiresAtUtc, DateTimeOffset LastSentAtUtc, int FailedAttempts);
    private bool IsReady => configuration.GetValue("EmailOtp:Enabled", false)
        && emailSender.IsConfigured
        && Encoding.UTF8.GetByteCount(configuration["EmailOtp:HashingKey"] ?? "") >= 32;

    public async Task<EmailOtpStartResult> RegisterAsync(string email, string password, string displayName, CancellationToken cancellationToken)
    {
        if (!IsReady) return new(EmailOtpStartOutcome.NotConfigured);
        var normalized = email.Trim();
        var existing = await users.FindByEmailAsync(normalized);
        if (existing is not null) return new(EmailOtpStartOutcome.EmailAlreadyRegistered);
        var user = new ApplicationUser { UserName = normalized, Email = normalized, DisplayName = displayName.Trim(), EmailConfirmed = false };
        var created = await users.CreateAsync(user, password);
        if (!created.Succeeded)
        {
            if (created.Errors.Any(e => e.Code.Contains("Duplicate", StringComparison.OrdinalIgnoreCase))) return new(EmailOtpStartOutcome.EmailAlreadyRegistered);
            return new(EmailOtpStartOutcome.InvalidCredentials);
        }
        return await IssueAsync(user, "register", cancellationToken);
    }

    public async Task<EmailOtpStartResult> StartLoginAsync(string email, string password, CancellationToken cancellationToken)
    {
        if (!IsReady) return new(EmailOtpStartOutcome.NotConfigured);
        var user = await users.FindByEmailAsync(email.Trim());
        if (user is null || !await users.CheckPasswordAsync(user, password)) return new(EmailOtpStartOutcome.InvalidCredentials);
        return await IssueAsync(user, user.EmailConfirmed ? "login" : "register", cancellationToken);
    }

    public async Task<EmailOtpStartResult> ResendAsync(string email, string password, string purpose, CancellationToken cancellationToken)
    {
        if (!IsReady) return new(EmailOtpStartOutcome.NotConfigured);
        var user = await users.FindByEmailAsync(email.Trim());
        if (user is null || !await users.CheckPasswordAsync(user, password)) return new(EmailOtpStartOutcome.InvalidCredentials);
        var normalizedPurpose = purpose.Trim().ToLowerInvariant();
        if (normalizedPurpose == "register" && user.EmailConfirmed) return new(EmailOtpStartOutcome.InvalidCredentials);
        if (normalizedPurpose == "login" && !user.EmailConfirmed) normalizedPurpose = "register";
        if (normalizedPurpose is not ("register" or "login")) return new(EmailOtpStartOutcome.InvalidCredentials);
        return await IssueAsync(user, normalizedPurpose, cancellationToken);
    }

    public async Task<EmailOtpCompletionResult> VerifyAsync(string email, string code, CancellationToken cancellationToken)
    {
        if (!IsReady) return new(EmailOtpCompletionOutcome.NotConfigured);
        var user = await users.FindByEmailAsync(email.Trim());
        if (user is null || code.Length != 6 || code.Any(c => c is < '0' or > '9')) return new(EmailOtpCompletionOutcome.InvalidOrExpiredCode);
        var saved = await users.GetAuthenticationTokenAsync(user, LoginProvider, TokenName);
        if (string.IsNullOrWhiteSpace(saved)) return new(EmailOtpCompletionOutcome.InvalidOrExpiredCode);
        Challenge? challenge;
        try { challenge = JsonSerializer.Deserialize<Challenge>(saved); }
        catch (JsonException) { challenge = null; }
        var now = DateTimeOffset.UtcNow;
        if (challenge is null || challenge.ExpiresAtUtc <= now || challenge.FailedAttempts >= MaxAttempts)
            return new(EmailOtpCompletionOutcome.InvalidOrExpiredCode);

        var suppliedHash = HashCode(user.Id, challenge.Purpose, code);
        var expected = Convert.FromHexString(challenge.CodeHash);
        var supplied = Convert.FromHexString(suppliedHash);
        if (!CryptographicOperations.FixedTimeEquals(expected, supplied))
        {
            var failed = challenge with { FailedAttempts = challenge.FailedAttempts + 1 };
            var failedUpdate = await users.SetAuthenticationTokenAsync(user, LoginProvider, TokenName, JsonSerializer.Serialize(failed));
            if (!failedUpdate.Succeeded) logger.LogWarning("Could not update email OTP attempt count for user {UserId}.", user.Id);
            return new(EmailOtpCompletionOutcome.InvalidOrExpiredCode);
        }

        if (challenge.Purpose == "register" && !user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            var update = await users.UpdateAsync(user);
            if (!update.Succeeded) return new(EmailOtpCompletionOutcome.InvalidOrExpiredCode);
        }
        else if (challenge.Purpose == "login" && !user.EmailConfirmed)
        {
            return new(EmailOtpCompletionOutcome.InvalidOrExpiredCode);
        }

        await users.RemoveAuthenticationTokenAsync(user, LoginProvider, TokenName);
        var roles = await users.GetRolesAsync(user);
        return new(EmailOtpCompletionOutcome.Succeeded, jwtTokens.GenerateTokens(user.Id, user.Email!, roles.ToList()));
    }

    private async Task<EmailOtpStartResult> IssueAsync(ApplicationUser user, string purpose, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var saved = await users.GetAuthenticationTokenAsync(user, LoginProvider, TokenName);
        if (!string.IsNullOrWhiteSpace(saved))
        {
            try
            {
                var previous = JsonSerializer.Deserialize<Challenge>(saved);
                if (previous is not null && now - previous.LastSentAtUtc < ResendDelay) return new(EmailOtpStartOutcome.RateLimited);
            }
            catch (JsonException) { }
        }
        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var challenge = new Challenge(purpose, HashCode(user.Id, purpose, code), now.Add(CodeLifetime), now, 0);
        var savedChallenge = await users.SetAuthenticationTokenAsync(user, LoginProvider, TokenName, JsonSerializer.Serialize(challenge));
        if (!savedChallenge.Succeeded)
        {
            logger.LogWarning("Could not persist an email OTP challenge for user {UserId}.", user.Id);
            return new(EmailOtpStartOutcome.DeliveryUnavailable);
        }
        if (await emailSender.SendLoginCodeAsync(user.Email!, code, cancellationToken)) return new(EmailOtpStartOutcome.Accepted);
        logger.LogWarning("Could not deliver account email OTP for user {UserId}.", user.Id);
        return new(EmailOtpStartOutcome.DeliveryUnavailable);
    }

    private string HashCode(string userId, string purpose, string code)
    {
        var key = Encoding.UTF8.GetBytes(configuration["EmailOtp:HashingKey"] ?? "");
        var data = Encoding.UTF8.GetBytes($"{userId}:{purpose}:{code}");
        return Convert.ToHexString(HMACSHA256.HashData(key, data));
    }
}
