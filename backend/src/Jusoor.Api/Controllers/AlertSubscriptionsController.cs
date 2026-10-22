using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using Jusoor.Domain.Entities;
using Jusoor.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jusoor.Api.Controllers;

[ApiController]
[Route("api/v1/alert-subscriptions")]
public sealed class AlertSubscriptionsController(ApplicationDbContext db) : ControllerBase
{
    public sealed record SubscribeRequest(string? Email, bool Consent, string? Website);

    [HttpGet("status")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        var setting = await db.AlertSubscriptionSettings.AsNoTracking()
            .SingleOrDefaultAsync(x => x.Key == AlertSubscriptionSettings.SingletonKey, cancellationToken);
        return Ok(new { enabled = setting?.IsEnabled ?? true });
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Subscribe(SubscribeRequest request, CancellationToken cancellationToken)
    {
        // Honeypot for basic automated form spam. Do not reveal whether an address is already stored.
        if (!string.IsNullOrWhiteSpace(request.Website)) return Ok(new { accepted = true });
        if (!request.Consent || string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "أدخل بريدك ووافق على استخدامه لإرسال تنبيهات الأزمات." });

        var email = request.Email.Trim();
        if (email.Length > 320 || !MailAddress.TryCreate(email, out var parsed) ||
            !string.Equals(parsed.Address, email, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "أدخل بريدًا إلكترونيًا صحيحًا." });

        var settings = await db.AlertSubscriptionSettings.AsNoTracking()
            .SingleOrDefaultAsync(x => x.Key == AlertSubscriptionSettings.SingletonKey, cancellationToken);
        if (settings?.IsEnabled == false)
            return Conflict(new { message = "الاشتراك في التنبيهات مغلق مؤقتًا." });

        var normalized = email.ToUpperInvariant();
        var emailHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(normalized)));
        var subscription = await db.AlertEmailSubscriptions
            .SingleOrDefaultAsync(x => x.EmailHash == emailHash, cancellationToken);
        if (subscription is null)
            db.AlertEmailSubscriptions.Add(AlertEmailSubscription.Create(email, emailHash, DateTimeOffset.UtcNow));
        else
            subscription.Resubscribe(DateTimeOffset.UtcNow);

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { accepted = true });
    }
}

[ApiController]
[Route("api/v1/cms/alert-subscriptions/settings")]
[Authorize(Policy = Jusoor.Application.Common.Security.AuthorizationPolicies.CanManageCrisisMode)]
public sealed class CmsAlertSubscriptionSettingsController(ApplicationDbContext db) : ControllerBase
{
    public sealed record UpdateRequest(bool Enabled);

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var setting = await db.AlertSubscriptionSettings.AsNoTracking()
            .SingleOrDefaultAsync(x => x.Key == AlertSubscriptionSettings.SingletonKey, cancellationToken);
        var count = await db.AlertEmailSubscriptions.CountAsync(x => x.IsActive, cancellationToken);
        return Ok(new { enabled = setting?.IsEnabled ?? true, activeSubscriptions = count, updatedAtUtc = setting?.UpdatedAtUtc });
    }

    [HttpPut]
    public async Task<IActionResult> Update(UpdateRequest request, CancellationToken cancellationToken)
    {
        var setting = await db.AlertSubscriptionSettings
            .SingleOrDefaultAsync(x => x.Key == AlertSubscriptionSettings.SingletonKey, cancellationToken);
        if (setting is null)
            db.AlertSubscriptionSettings.Add(AlertSubscriptionSettings.Create(request.Enabled, DateTimeOffset.UtcNow));
        else
            setting.SetEnabled(request.Enabled, DateTimeOffset.UtcNow);

        await db.SaveChangesAsync(cancellationToken);
        return await Get(cancellationToken);
    }
}
